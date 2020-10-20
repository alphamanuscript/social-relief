import { Db, Collection } from 'mongodb';
import { Transaction, TransactionStatus, TransactionCreateArgs, TransactionService, PaymentProvider, InitiateDonationArgs, SendDonationArgs, PaymentProviderRegistry } from './types';
import { generateId, validateId } from '../util';
import { createDbOpFailedError, AppError, createResourceNotFoundError, rethrowIfAppError, createInsufficientFundsError } from '../error';
import { User } from '../user';
import * as messages from '../messages';
import * as validators from './validator';
import { EventBus } from '../event';

export const COLLECTION = 'transactions';

export interface TransactionsArgs {
  paymentProviders: PaymentProviderRegistry;
  eventBus: EventBus;
}

const isFinalStatus = (status: TransactionStatus) =>
  status === 'failed' || status === 'success';

export class Transactions implements TransactionService {
  private db: Db;
  private collection: Collection<Transaction>;
  private providers: PaymentProviderRegistry;
  private eventBus: EventBus;
  private indexesCreated: boolean;

  constructor(db: Db, args: TransactionsArgs) {
    this.db = db;
    this.collection = this.db.collection(COLLECTION);
    this.providers = args.paymentProviders;
    this.eventBus = args.eventBus;
    this.indexesCreated = false;
  }
  
  async createIndexes(): Promise<void> {
    if (this.indexesCreated) return;

    try {
      // unique provider transaction id
      await this.collection.createIndex(
        {
          providerTransactionId: 1, provider: 1
        },
        {
          unique: true,
          partialFilterExpression: {
            providerTransactionId: { $exists: true }
          }
        });
      // ttl collection for access token expiry
      await this.collection.createIndex({ from: 1 });
      
      this.indexesCreated = true;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async getAllByUser(userId: string): Promise<Transaction[]> {
    validators.validatesGetAllByUser(userId);
    try {
      const result = await this.collection.find({ $or: [{ from: userId }, { to: userId }] }).sort({ createdAt: -1 }).toArray();
      return result;
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  async initiateDonation(user: User, args: InitiateDonationArgs): Promise<Transaction> {
    validators.validatesInitiateDonation({ userId: user._id, amount: args.amount });
    const amount = Math.floor(args.amount);

    const provider = this.receivingProvider();

    const trxArgs: TransactionCreateArgs = {
      expectedAmount: amount,
      to: user._id,
      from: '',
      fromExternal: true,
      toExternal: false,
      type: 'donation',
      provider: provider.name()
    };

    try {
      const requestResult = await provider.requestPaymentFromUser(user, amount);
      trxArgs.providerTransactionId = requestResult.providerTransactionId;
      trxArgs.status = requestResult.status;
      trxArgs.metadata = requestResult.metadata;

      const result = await this.create(trxArgs);
      return result;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async sendDonation(from: User, to: User, args: SendDonationArgs): Promise<Transaction> {
    validators.validatesSendDonation({ from: from._id, to: to._id, amountArg: args });
    const amount = Math.floor(args.amount);

    const trxArgs: TransactionCreateArgs = {
      expectedAmount: amount,
      to: to._id,
      from: from._id,
      fromExternal: false,
      toExternal: true,
      type: 'distribution',
      provider: this.sendingProvider().name()
    };

    try {
      const transaction = await this.sendFundsToUser(to, trxArgs);
      return transaction;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async initiateRefund(user: User): Promise<Transaction> {

    try {
      // we refund the user the current total balance on their account
      const balance = await this.getUserBalance(user._id);
      
      if (balance <= 0) throw createInsufficientFundsError(messages.ERROR_NO_BALANCE_FOR_REFUNDS);

      const args: TransactionCreateArgs = {
        expectedAmount: balance,
        to: '',
        toExternal: true,
        fromExternal: false,
        from: user._id,
        type: 'refund',
        provider: this.sendingProvider().name()
      };

      const trx = await this.sendFundsToUser(user, args);
      return trx;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e.message);
    }
  }

  async handleProviderNotification(providerName: string, payload: any): Promise<Transaction> {
    try {
      const now = new Date();
      const provider = this.provider(providerName);
      const result = await this.provider(providerName).handlePaymentNotification(payload);

      const updatedRes = await this.collection.findOneAndUpdate(
        { providerTransactionId: result.providerTransactionId, provider: provider.name() },
        {
          $set: {
            status: result.status,
            failureReason: result.failureReason,
            metadata: result.metadata,
            updatedAt: now,
            amount: result.amount
          },
        }, { returnOriginal: false });
      
      if (!updatedRes.value) {
        // TODO: handle notifications that don't correspond to transactions
        // these are transactions that were not initiated for the app by a user
        throw createResourceNotFoundError(messages.ERROR_TRANSACTION_REQUESTED);
      }

      if (updatedRes.value.status === 'success') {
        this.eventBus.emitTransactionCompleted({ transaction: updatedRes.value });
      }

      return updatedRes.value;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async checkUserTransactionStatus(userId: string, transactionId: string): Promise<Transaction> {
    validators.validatesCheckUserTransactionStatus({ userId, transactionId });
    try {
      const trx = await this.collection.findOne({ _id: transactionId, $or: [{ from: userId }, { to: userId }] });
      if (!trx) throw createResourceNotFoundError(messages.ERROR_TRANSACTION_NOT_FOUND);
      
      if (isFinalStatus(trx.status)) {
        return trx;
      }

      const providerResult = await this.provider(trx.provider).getTransaction(trx);
      const updatedRes = await this.collection.findOneAndUpdate(
        { _id: trx._id }, 
        {
          $set: {
            status: providerResult.status,
            failureReason: providerResult.failureReason,
            metadata: providerResult.metadata,
            updatedAt: new Date(),
            amount: providerResult.amount
        }
      }, { returnOriginal: false });
      
      if (!updatedRes.value) throw createResourceNotFoundError(messages.ERROR_TRANSACTION_NOT_FOUND);
      return updatedRes.value;
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createDbOpFailedError(e.message);
    }
  }

  async getUserBalance(userId: string): Promise<number> {
    validateId(userId);

    try {
      const results = await this.collection.aggregate<{ balance: number }>([
        {
          // get transactions to or from this user
          $match: {
            $or: [
              // be conservative when dealing with pending transactions:
              // if transaction is from the user, deduct it from balance unless it's failed
              // if transaction is to user, add it to balance only if it's successful
              { from: userId, status: { $ne: 'failed' } },
              { to: userId, status: 'success' }
            ]},
        },
        {
          $project: { from: 1, to: 1, amount: 1, expectedAmount: 1, status: 1 }
        },
        {
          // group by incoming (1) or outgoing (-1) transactions
          $group: {
            _id: {
              $cond: { if: { $eq: ['$to', userId] }, then: 1, else: -1 }
            },
            total: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, '$amount', '$expectedAmount']
              }
            }
          }
        },
        {
          // subtract inbound from outgoing transactions
          $group: { _id: null, balance: { $sum: { $multiply: ['$_id', '$total'] } } }
        }
      ]).toArray();

      if (!results.length) return 0;

      return results[0].balance;
    }
    catch (e) {
      rethrowIfAppError(e);
      throw createDbOpFailedError(e);
    }
  }

  private async create(args: TransactionCreateArgs): Promise<Transaction> {
    const now = new Date();
    const tx: Transaction = {
      _id: generateId(),
      ...args,
      amount: 0,
      status: args.status || 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: args.metadata || {}
    };

    if (args.providerTransactionId) {
      tx.providerTransactionId = args.providerTransactionId
    }

    try {
      const res = await this.collection.insertOne(tx);
      return res.ops[0];
    }
    catch (e) {
      throw createDbOpFailedError(e.message);
    }
  }

  private async sendFundsToUser(user: User, args: TransactionCreateArgs): Promise<Transaction> {
    let trx: Transaction;
    const provider = this.sendingProvider();
    const modifiedArgs = { ...args };
    modifiedArgs.provider = provider.name();
    modifiedArgs.status = 'pending';

    try {
      // Create local transaction before making call to provider
      // that way if transaction is queued at the provider but a network
      // error occurs before we get the response, the transaction record
      // will ensure that those funds are not used for another transaction
      // that would result in a double-spend
      // If, one the other hand, the transaction record is created but an
      // error occurs before the provider queues it, then the system
      // will think it has less money that it actually has available. This is
      // an easier problem to deal with than a double-spend. If we notice
      // that this transaction record become stale, we
      // can check the logs at the provider site and if we don't find a matching
      // transaction, then we'll simply mark this transaction record as failed
      // and that's enough to synchronize the system
      trx = await this.create(modifiedArgs);
      const providerResult = await provider.sendFundsToUser(user, args.expectedAmount, { transaction: trx._id });
      const updatedRes = await this.collection.findOneAndUpdate(
        { _id: trx._id },
        { 
          $set: {
            providerTransactionId: providerResult.providerTransactionId,
            status: providerResult.status,
            updatedAt: new Date()
          }
        },
        { returnOriginal: false });
      
      return updatedRes.value;
    }
    catch (e) {
      if (e instanceof AppError) {
        if (e.code === 'b2cRequestFailed' && trx) {
          // transaction record was created but was not queued by provider
          // we can delete it (should we mark it as failed instead?)
          try {
            await this.collection.deleteOne({ _id: trx._id})
          } catch (e) {};
        }

        throw e;
      }

      throw createDbOpFailedError(e.message);
    }
  }

  private provider(name: string): PaymentProvider {
    return this.providers.getProvider(name);
  }

  private receivingProvider(): PaymentProvider {
    return this.providers.getPreferredForReceiving();
  }

  private refundProvider(): PaymentProvider {
    return this.providers.getPreferredForRefund();
  }

  private sendingProvider(): PaymentProvider {
    return this.providers.getPreferredForSending();
  }
}