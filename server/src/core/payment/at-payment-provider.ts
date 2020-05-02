import createAtClient, { PaymentsService as AtPaymentService, MobileCheckoutArgs } from 'africastalking';
import { PaymentProvider, PaymentRequestResult } from './types';
import { createAppError } from '../error';
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
    return "africastalking-mpesa";
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
      console.log('RES', res);
      /*
      {
        description: 'Waiting for user input',
        providerChannel: '525900',
        status: 'PendingConfirmation',
        transactionId: 'ATPid_67ece6ce47375daad33db06f2f4b6139'
      }
      */
     return {
       providerTransactionId: res.transactionId,
       status: 'paymentRequested'
     };
    }
    catch (e) {
      console.error('AT ERROR', e);
      throw createAppError(e.message, 'atApiError');
    }
  }
}