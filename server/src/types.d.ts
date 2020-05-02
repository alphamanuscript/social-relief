declare module 'africastalking' {
  export interface Client {
    PAYMENTS: PaymentsService
  }

  export interface PaymentsService {
    /**
     * Initiates mobile checkout
     * @param args 
     */
    mobileCheckout(args: MobileCheckoutArgs): Promise<MobileCheckoutResult>;
  }

  export interface MobileCheckoutArgs {
    /**
     * Your payment product.
     */
    productName: string,
    /**
     * Provider channel to consider when charging.
     */
    providerChannel?: string,
    /**
     * Mobile wallet to charge.
     */
    phoneNumber: string,
    /**
     * 3-digit ISO format currency code. e.g.: 'KES'
     */
    currencyCode: string,
    /**
     * Amount to charge
     */
    amount: number,
    /**
     * Additional info to go with the checkout
     * this metadata will also be included in the notification
     */
    metadata?: {
      [property: string]: any
    }
  }

  export interface MobileCheckoutResult {
    /**
     * A detailed description of the request status.
     */
    description: string,
    /**
     * The provider channel that was used to initiate this transaction.
     */
    providerChannel: string,
    /**
     * The status of the request. Possible values are:
     * - `PendingConfirmation`: The request has been accepted and we are waiting for the subscriber to confirm the payment.
     * - `InvalidRequest`: The request could not be accepted as one of the fields was invalid. The description field will contain more information.
     * - `NotSupported`: Checkout to the provided phone number is not supported.
     * - `Failed`: The request failed for some other reason. The description filed will contain more information.
     */
    status: 'PendingConfirmation' | 'InvalidRequest' | 'NotSupported' | 'Failed',
    /**
     * A unique id that our API generates for successful requests. This transactionId will be sent along with the payment notification.
     */
    transactionId: string
  }

  export interface ClientCredentials {
    username: string;
    apiKey: string;
  }

  export default function CreateClient(credentials: ClientCredentials): Client;
}