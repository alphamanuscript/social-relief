import createAtClient = require('africastalking');
import { PaymentsService as AtPaymentService, MobileCheckoutArgs, TransactionInfo } from 'africastalking-types';
import { PaymentProvider, PaymentRequestResult, ProviderTransactionInfo } from './types';
import { AppError, createPaymentRequestFailedError, createAtApiError } from '../error';
import { User } from '../user/types';

export interface AtArgs {
  username: string,
  apiKey: string,
  paymentsProductName: string,
  paymentsProviderChannel: string
};

export class AtPaymentProvider implements PaymentProvider {
  private atClient: any;
  private payments: AtPaymentService;
  private productName: string;
  private providerChannel: string;

  constructor(args: AtArgs) {
    this.atClient = createAtClient({ username: args.username, apiKey: args.apiKey });
    this.payments = this.atClient.PAYMENTS;
    this.productName = args.paymentsProductName;
    this.providerChannel = args.paymentsProviderChannel;
  }

  name() {
    return 'africastalking-mpesa';
  }

  async requestPaymentFromUser(user: User, amount: number): Promise<PaymentRequestResult> {
    const args: MobileCheckoutArgs = {
      productName: this.productName,
      providerChannel: this.providerChannel,
      phoneNumber: `+${user.phone}`,
      amount,
      currencyCode: 'KES',
      metadata: {
        fromUser: user._id
      }
    };

    try {
      const res = await this.payments.mobileCheckout(args);

      if (res.status === 'PendingConfirmation') {
        return {
          providerTransactionId: res.transactionId,
          status: 'paymentRequested'
        };
      }
      
      throw createPaymentRequestFailedError(res.description);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createAtApiError(e.message);
    }
  }

  handlePaymentNotification(payload: any): Promise<ProviderTransactionInfo> {
    return Promise.resolve(this.extractTransactionInfo(payload));
  }

  async getTransaction(id: string): Promise<ProviderTransactionInfo> {
    try {
      const result = await this.payments.findTransaction({ transactionId: id });
      if (result.status !== 'Success') throw createAtApiError(result.errorMessage);

      return this.extractTransactionInfo(result.data);
    }
    catch (e) {
      if (e instanceof AppError) throw e;
      throw createAtApiError(e.message);
    }
  }

  private extractTransactionInfo(notification: TransactionInfo): ProviderTransactionInfo {
    const result: ProviderTransactionInfo = {
      status: notification.status === 'Success' ? 'success' : 'failed',
      providerTransactionId: notification.transactionId,
      metadata: notification,
      amount: Number(notification.value.split(' ')[1]),
      userData: {}
    };

    if (notification.sourceType === 'PhoneNumber') {
      result.userData.phone = notification.source.substr(1);
    }

    if (notification.status !== 'Success') {
      result.failureReason = notification.description;
    }

    return result;
  }
}
