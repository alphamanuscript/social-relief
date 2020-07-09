import * as axios from 'axios';
import { PaymentProvider, PaymentRequestResult, ProviderTransactionInfo, SendFundsResult } from './types';
import { User } from '../user';
import { generateId } from '../util';
import { createAppError, createFlutterwaveApiError } from '../error';

const API_BASE_URL = 'https://api.flutterwave.com/v3';

function getUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}


export const FLUTTERWAVE_PAYMENT_PROVIDER_NAME = 'flutterwave';

export interface FlutterwavePaymentProviderArgs {
  secretKey: string;
  redirectUrl: string;
  logoUrl: string;
}

interface FlutterwaveInitiatePaymentResponse {
  status: string;
  message: string;
  data: {
    link: string;
  }
}

export class FlutterwavePaymentProvider implements PaymentProvider {

  constructor(private args: FlutterwavePaymentProviderArgs) {
  }

  name(): string {
    return FLUTTERWAVE_PAYMENT_PROVIDER_NAME;
  }

  async requestPaymentFromUser(user: User, amount: number): Promise<PaymentRequestResult> {
    const data = {
      // ideally tx_ref should be our transaction id
      // but since that isn't available to this method, we just generate a random unique id
      tx_ref: generateId(),
      amount,
      currency: 'KES',
      payment_options: 'card,mpesa',
      redirect_url: this.args.redirectUrl,
      customer: {
        email: user.email,
        phonenumber: user.phone,
        name: user.name
      },
      customizations: {
        title: 'Social Relief Donation',
        description: 'Social Relief Donation',
        logo: this.args.logoUrl
      },
      meta: {
        userId: user._id
      }
    };

    try {
      const res = await axios.default.post<FlutterwaveInitiatePaymentResponse>(
        getUrl('/payments'),
        data,
        { headers: { Authorization: `Bearer ${this.args.secretKey}`} });

      return {
        providerTransactionId: data.tx_ref,
        status: res.data.status === 'success' ? 'pending' : 'failed',
        metadata: {
          paymentUrl: res.data.data.link
        }
      };
    }
    catch (e) {
      throw createFlutterwaveApiError(e.response.data && e.response.data.message || e.message);
    }
  }

  handlePaymentNotification(payload: any): Promise<ProviderTransactionInfo> {
    throw new Error('Method not implemented.');
  }
  getTransaction(id: string): Promise<ProviderTransactionInfo> {
    throw new Error('Method not implemented.');
  }
  sendFundsToUser(user: User, amount: number, metadata: any): Promise<SendFundsResult> {
    throw new Error('Method not implemented.');
  }

}
