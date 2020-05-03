import createAtClient = require('africastalking');
import { PaymentsService as AtPaymentService, MobileCheckoutArgs, PaymentNotification } from 'africastalking-types';
import { PaymentProvider, PaymentRequestResult, PaymentNotificationResult } from './types';
import { createAppError, AppError, createPaymentRequestFailedError } from '../error';
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
        user: user._id
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
      throw createAppError(e.message, 'atApiError');
    }
  }

  handlePaymentNotification(payload: any): Promise<PaymentNotificationResult> {
    const notification = payload as PaymentNotification;
    const result: PaymentNotificationResult = {
      status: notification.status === 'Success' ? 'success' : 'failed',
      providerTransactionId: notification.transactionId,
      metadata: notification
    };

    if (notification.status !== 'Success') {
      result.failureReason = notification.description;
    }

    return Promise.resolve(result);
  }
}