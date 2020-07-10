import * as axios from 'axios';
import { PaymentProvider, PaymentRequestResult, ProviderTransactionInfo, SendFundsResult, TransactionStatus, Transaction } from './types';
import { User } from '../user';
import { generateId } from '../util';
import { createFlutterwaveApiError } from '../error';
import { not } from '@hapi/joi';

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

interface FlutterwaveTransactionInfo {
  id: string;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  charged_amount: number;
  amount_settled: number;
  status: string;
  payment_type: string;
  narration: string;
  processor_response: string;
  customer: {
    id: string;
    name: string;
    phone_number: string;
    created_at: string;
  }
}

interface FlutterwaveNotification {
  event: string;
  'event.type': string;
  data: FlutterwaveTransactionInfo;
}

interface FlutterwaveTransactionResponse {
  status: string;
  message: string;
  data: FlutterwaveTransactionInfo;
}

function extractTransactionInfo(data: FlutterwaveTransactionInfo): ProviderTransactionInfo {
  const status: TransactionStatus = data.status === 'successful' ? 'success' :
      data.status === 'failed' ? 'failed' : 'pending';

  return {
    userData: {
      phone: data.customer.phone_number
    },
    status,
    amount: data.charged_amount,
    providerTransactionId: data.tx_ref,
    metadata: data,
    failureReason: status === 'failed' ? data.processor_response: ''
  };
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
        phone_number: user.phone,
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
        { headers: { Authorization: `Bearer ${this.args.secretKey}` } });

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

  async handlePaymentNotification(payload: any): Promise<ProviderTransactionInfo> {
    const notification: FlutterwaveNotification = payload;
    const { data } = notification;
    return extractTransactionInfo(data);
  }

  async getTransaction(localTransaction: Transaction): Promise<ProviderTransactionInfo> {
    if (!localTransaction.metadata.id) {
      // if the transaction doesn't have an id in metadata,
      // then payment notification has not been received yet
      // in that case we assume the transaction is still pending
      return {
        status: localTransaction.status,
        userData: {},
        metadata: localTransaction.metadata,
        amount: localTransaction.amount,
        providerTransactionId: localTransaction.providerTransactionId
      };
    }

    const id: string = localTransaction.metadata.id;

    try {
      const url = getUrl(`/transactions/${id}/verify`);
      const res = await axios.default.get<FlutterwaveTransactionResponse>(url,
        { headers: { Authorization: `Bearer ${this.args.secretKey}`}});
      
      return extractTransactionInfo(res.data.data);
    }
    catch (e) {
      throw createFlutterwaveApiError(e.response.data && e.response.data.message || e.message);
    }
  }
  sendFundsToUser(user: User, amount: number, metadata: any): Promise<SendFundsResult> {
    throw new Error('Method not implemented.');
  }

}
