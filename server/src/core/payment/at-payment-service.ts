// import * as AfricasTalking from 'africastalking';
const AfricasTalking = require('africastalking');
import { PaymentService } from './types';
import { createAppError } from '../error';

export interface AtArgs {
  username: string,
  apiKey: string,
  paymentsProductName: string
};

export class AtPayments implements PaymentService {
  private atClient: any;
  private payments: any;
  private productName: string;

  constructor(args: AtArgs) {
    this.atClient = AfricasTalking(args.username, args.apiKey);
    this.payments = this.atClient.PAYMENTS;
    this.productName = args.paymentsProductName;
  }

  async initiatePaymentFromUser(user: import("../user").User, transaction: import("../transaction").Transaction): Promise<void> {
    const args = {
      productName: this.productName,
      phoneNumber: user.phone,
      currencyCode: 'KES',
      amount: transaction.amount,
      metadata: {
        transaction: transaction._id
      }
    };

    try {
      const res = await this.payments.mobileCheckout(args);
    }
    catch (e) {
      throw createAppError(e.message, 'atApiError');
    }
  }
}