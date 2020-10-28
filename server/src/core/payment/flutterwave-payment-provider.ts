import * as axios from 'axios'; 
import { PaymentProvider, PaymentRequestResult, ProviderTransactionInfo, SendFundsResult, TransactionStatus, Transaction } from './types';
import { User } from '../user';
import { generateId } from '../util';
import { createFlutterwaveApiError } from '../error';

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

interface FlutterwaveTransferInfo {
  id: number;
  account_number: string;
  bank_code: string;
  full_name: string;
  created_at: string;
  currency: string;
  debit_currency: string;
  amount: number;
  fee: number;
  status: string;
  reference: string;
  meta: any;
  narration: string;
  complete_message: string;
  requires_approval: number;
  is_approved: number;
  bank_name: string;
};
  
interface FlutterwaveInitiateTransferResponse {
  status: string;
  message: string;
  data: FlutterwaveTransferInfo
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
  data: FlutterwaveTransactionInfo | FlutterwaveTransferInfo;
}

interface FlutterwaveTransactionResponse {
  status: string;
  message: string;
  data: FlutterwaveTransactionInfo;
}

function extractTransactionInfo(data: FlutterwaveTransactionInfo): ProviderTransactionInfo {
  const flwStatus = data.status.toLowerCase();
  const status: TransactionStatus = flwStatus === 'successful' ? 'success' :
      flwStatus  === 'failed' ? 'failed' : 'pending';
  
  // phone number comes in in 07... format, strip the 0
  const flwPhone = data.customer?.phone_number?.substring(1);
  const phone = flwPhone ? `254${flwPhone}` : ''; // convert to internal 254 format

  return {
    userData: {
      phone,
    },
    status,
    amount: data.amount,
    providerTransactionId: data.tx_ref,
    metadata: data,
    failureReason: status === 'failed' ? data.processor_response: ''
  };
}

function extractTransferInfo(data: FlutterwaveTransferInfo): ProviderTransactionInfo {
  const flwStatus = data.status.toLowerCase();
  const status: TransactionStatus = flwStatus === 'successful' ? 'success' :
      flwStatus  === 'failed' ? 'failed' : 'pending';
  
  let phone = '';
  // if it's an M-PESA transfer, then account_number is the phone number
  if (data.bank_code === 'MPS') {
    // phone number comes in in 07... format, strip the 0
    const flwPhone = data.account_number.substring(1);
    phone = flwPhone ? `254${flwPhone}` : ''; // convert to internal 254 format
  }
  
  return {
    userData: {
      phone
    },
    status,
    amount: data.amount,
    providerTransactionId: data.reference,
    metadata: data,
    failureReason: status === 'failed' ? data.complete_message : ''
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
        phone_number: `0${user.phone.substr(3)}`, // user local instead of internal format
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

    if (notification['event.type'] === 'Transfer') {
      return extractTransferInfo(data as FlutterwaveTransferInfo);
    }

    return extractTransactionInfo(data as FlutterwaveTransactionInfo);
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
  async sendFundsToUser(user: User, amount: number, metadata: any): Promise<SendFundsResult> {
    const transferArgs = { 
      account_bank: 'MPS',
      account_number: `0${user.phone.substring(3)}`,
      amount,
      narration: 'Social Relief transfer',
      currency: 'KES',
      reference: generateId(),
      beneficiary_name: user.name
    };
    
    try {
      const url = getUrl(`/transfers`);
      const res = await axios.default.post<FlutterwaveInitiateTransferResponse>(url, transferArgs, { headers: { Authorization: `Bearer ${this.args.secretKey}`}});
      
      const { data, status } = res.data;
      console.log('Flutterwave transfer payload', JSON.stringify(res.data, null, 2));

      return {
        providerTransactionId: data.reference,
        // success from the API means that the transaction was queued successfully, not that it's completed
        status: status === 'success' ? 'pending' : 'failed'
      };
    }
    catch(e) {
      throw createFlutterwaveApiError(e.response.data && e.response.data.message || e.message);
    }
  }

}
