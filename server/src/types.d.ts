declare module 'africastalking-types' {
  interface ClientCredentials {
    username: string;
    apiKey: string;
  }

  interface Client {
    PAYMENTS: PaymentsService
  }

  interface PaymentsService {
    /**
     * Initiates mobile checkout
     * @param args 
     */
    mobileCheckout(args: MobileCheckoutArgs): Promise<MobileCheckoutResult>;
    /**
     * Send mobile money to consumer
     * @param args 
     */
    mobileB2C(args: MobileB2CArgs): Promise<MobileB2CResult>;
    /**
     * Find a particular transaction
     * @param args 
     */
    findTransaction(args: FindTransactionArgs): Promise<FindTransactionResult>;
  }

  interface MobileCheckoutArgs {
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
      [property: string]: string
    }
  }

  interface MobileCheckoutResult {
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

  export interface MobileB2CArgs {
    /**
     * Your payment product
     */
    productName: string;
    /**
     * A list of consumers that will receive the money
     */
    recipients: MobileB2CRecipient[];
  }

  export interface MobileB2CRecipient {
    /**
     * Name of the B2C transaction recipient
     */
    name?: string;
    /**
     * Phone number of the B2C transaction recipient
     */
    phoneNumber: string;
    /**
     * 3-digit ISO format currency code for the value of this transaction (e.g KES, UGX, USD, …)
     */
    currencyCode: string;
    /**
     * Amount - in the provided currency - that the client is expected to confirm.
     */
    amount: number;
    /**
     * The channel the payment will be made from e.g a paybill numbe
     */
    providerChannel?: string;
    /**
     * Purpose of the payment. If set, it should contain one of:
     * - SalaryPayment
     * - SalaryPaymentWithWithdrawalChargePaid
     * - BusinessPayment
     * - BusinessPaymentWithWithdrawalChargePaid
     * - PromotionPayment
     */
    reason?: 'SalaryPayment' | 'SalaryPaymentWithWithdrawalChargePaid' | 'BusinessPayment' | 'BusinessPaymentWithWithdrawalChargePaid' | 'PromotionPayment',
    /**
     * A map of any metadata that you would like us to associate with the request.
     * Use this field to send data that will map notifications to B2C requests.
     * It will be included in the notification we send once the B2C request is complete.
     */
    metadata: {
      [key: string]: string;
    }
  }

  export interface MobileB2CResult {
    /**
     * The number of B2C transactions that were successfully queued.
     */
    numQueued: number;
    /**
     * The total value of all the transactions that were successfully queued.
     * The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 100.50
     */
    totalValue?: string;
    /**
     * The total transaction fee charged for all the transactions that were successfully queued.
     * The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 100.50
     */
    totalTransactionFee: string;
    /**
     * A list of B2C entries
     */
    entries: MobileB2CResultEntry[];
    /**
     * Error message if the ENTIRE request was rejected by the API.
     * e.g Having too many requests or having duplicate numbers in the request.
     */
    errorMessage?: string;
  }

  export interface MobileB2CResultEntry {
    /**
     * The phone number of the B2C transaction recipient
     */
    phoneNumber: string;
    /**
     * The status of the B2C transaction: Possible values are:
     * - Queued: The transaction has been accepted and queued for processing by the payment provider.
     * - InvalidRequest: We could not accept the request because one of the fields was invalid. The errorMessage field will contain a detailed description of the requests status.
     * - NotSupported: B2C requests to the provided phone number is not supported.
     * - Failed: The request failed for some other reason. The errorMessage field will contain a detailed description of the request status.
     */
    status: 'Queued' | 'InvalidRequest' | 'NotSupported' | 'Failed';
    /**
     * A unique id that our API generates for successful requests. This transactionId will be sent along with the payment notification.
     */
    transactionId: string;
    /**
     * The provider that will be used to process the B2C request. Only sent back for Queued transactions
     */
    provider?: 'Mpesa' | 'Segovia' | 'Athena';
    /**
     * The channel that will be used to process the B2C request.
     * The value will typically be the channel mapped to the payment product used for this request.
     * An example is a PayBill or BuyGoods number mapped to your account.
     */
    providerChannel?: string;
    /**
     * The value to be sent to the mobile subscriber.
     * The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 100.50
     */
    value?: string;
    /**
     * The transaction fee charged by Africa’s Talking for this transaction.
     * Please note: The transaction fee will be deducted from your Africa’s Talking credits NOT your payment wallet.
     * The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 1.50
     */
    transactionFee?: string;
    /**
     * A more descriptive error message for the status of this transaction
     */
    errorMessage?: string;
  }

  export interface TransactionInfo {
    /**
     * A unique transactionId that we generate for every payment sent and received through our APIs.
     */
    transactionId: string,
    /**
     * The category of the payment. Possible values are:
     * - `BankCheckout`: For Consumer-to-Business payments initiated by your application through our Bank Checkout APIs
     * - `CardCheckout`: For Consumer-to-Business payments initiated by your application through our Card Checkout APIs
     * - `MobileCheckout`: For Consumer-to-Business payments initiated by your application through our Mobile Checkout APIs
     * - `MobileC2B`: For Consumer-to-Business payments initiated by a mobile subscriber through their device (e.g using a paybill number)
     * - `MobileB2C`: For Business-to-Consumer payments initiated by your application through our B2C APIs
     * - `MobileB2B`: For Business-to-Business payments initiated by your application through our B2B APIs
     * - `BankTransfer`: For Business-to-Business payments initiated by your application through our Bank Transfer APIs
     * - `WalletTransfer`: For Wallet-to-Wallet payments initiated by your application through our Wallet Transfer APIs
     * - `UserStashTopup`: For Wallet-to-application stash payments initiated by your application through our User Stash Topup APIs
     */
    category: 'BankCheckout' | 'CardCheckout' | 'MobileCheckout' | 'MobileC2B' | 'MobileB2C' |
      'MobileB2B' | 'BankTransfer' | 'WalletTransfer' | 'UserStashTopup';
    /**
     * The payment provider that facilitated this transaction
     */
    provider: 'Mpesa' | 'Segovia' | 'Flutterwave' | 'Admin' | 'Athena';
    /**
     * The unique ID generated by the payment provider for this transaction (e.g the M-PESA transactionId). This value is only provided for successful transactions.
     */
    providerRefId?: string;
    /**
     * The name or number of the channel that was used to facilitate this payment by the provider.
     * This could, for example, be the Mobile Provider’s Paybill or Buy Goods number that belongs to your organization
     */
    providerChannel: string;
    /**
     * The account name (if provided) used by a mobile subscriber to initiate this transaction. This value will only be present for Mobile C2B transactions.
     */
    clientAccount?: string;
    /**
     * The Africa’s Talking Payment Product that was used by your application to facilitate this transaction.
     */
    productName: string;
    /**
     * The type of party that is providing the funds for this transaction (the Debit Party). Possible values are:
     * `PhoneNumber`: Indicates that the funds are being provided by a mobile subscriber through their mobile device. This is the case for Mobile Checkout and Mobile C2B Transactions
     * `BankAccount`: Indicates that the funds are being provided by a customer through their Bank Account. This is the case for Bank Checkout Transactions
     * `Card`: Indicates that the funds are being provided by a customer through their Debit or Credit Card. This is the case for Card Checkout Transactions
     * `Wallet`: Indicates that the funds are being provided by your Africa’s Talking Wallet through one of your prodicts. This is the case for Mobile B2C Transactions
     */
    sourceType: 'PhoneNumber' | 'BankAccount' | 'Card' | 'Wallet';
    /**
     * Unique identifier of the party that is providing the funds for this transaction.
     * This value will contain either the phone number, bank account number or a card number of the customer who is sending funds to your application,
     * or the special value `PaymentWallet` that identifies your Africa’s Talking Payment Wallet.
     */
    source: string;
    /**
     * Unique identifier of the party that is receiving funds in this transaction (the Credit Party).
     */
    destinationType: 'PhoneNumber' | 'BankAccount' | 'Card' | 'Wallet';
    /**
     * Unique identifier of the party that is receiving the funds for this transaction.
     * This value will contain either a phone number, bank account number or a card number of the customer who is sending funds to your application,
     * or the special value PaymentWallet that identifies your Africa’s Talking Payment Wallet.
     */
    destination: string;
    /**
     * The value being exchanged in this transaction. The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 1.50
     */
    value: string;
    /**
     * The transaction fee charged by Africa’s Talking for this transaction.
     * The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 1.50 
     * Please note: The transaction fee will be deducted from your Africa’s Talking Stash NOT your payment wallet.
     */
    transactionFee?: string;
    /**
     * The fee charged by a payment provider to facilitate this transaction.
     * An example would be the fee charged to the owner of a Paybill by a Mobile Money Provider in order to facilitate a C2B transaction.
     * The format of this string is: (3-digit Currency Code)(space)(Decimal Value) e.g KES 1.50
     * This value is only present in the case where a transaction was successful and the provider fee is being passed on to your application.
     * Please Note: Tthis fee will also be deducted from the amount to be credited to your payment wallet.
     */
    providerFee?: string;
    /**
     * The final status of this transaction.
     */
    status: 'Success' | 'Failed';
    /**
     * A detailed description of this transaction, including a more detailed failure reason in the case of failures.
     */
    description: string;
    /**
     * Any metadata that was sent by your application when it initiated this transaction.
     * You can use this field to reconcile transactions with your implementation by,
     * for example, sending in KYC data or internal ids from your application that are linked to this transaction.
     * The map will be empty for transactions that are not initiated by your application (such as Mobile C2B transactions).
     */
    requestMetadata: {
      [property: string]: any;
    },
    /**
     * Any additional data that we receive from a payment provider for a particular transaction.
     * This could contain, for example, KYC data associated with a C2B transaction or any additional regulatory information that is passed to our APIs by payment providers.
     * The map will be empty in the case where a payment is not successful, or in the case where there is no additional data to provide.
     */
    providerMetadata: {
      [property: string]: any;
    },
    /**
     * The date and time (according to the payment provider) when a successful transaction was completed. This is only provided for successful transactions
     */
    transactionDate?: string;
  }

  export interface FindTransactionArgs {
    /**
     * Transaction ID returned on charge request
     */
    transactionId: string;
  }

  export interface FindTransactionResult {
    status: 'Success' | 'Failed';
    errorMessage?: string;
    data: TransactionInfo;
  }

  export interface SmsService {
    /**
     * Send sms to one or more recipients
     * @param args 
     */
    send(args: SendArgs): Promise<SendResult>;
  }

  export interface SendArgs {
    to: string[];
    message: string;
  }

  export interface SendResult {
    SMSMessageData: SMSMessageDataObj;
  }

  export interface SMSMessageDataObj {
    Message: string;
    Recipients: SMSRecipient[];
  }

  export interface SMSRecipient {
    statusCode: number;
    number: string;
    cost: string;
    status: 'Success' | 'Failed';
    messageId: string;
  }
}

declare module 'africastalking' {
  import { ClientCredentials, Client } from 'africastalking-types';
  function CreateClient(credentials: ClientCredentials): Client;
  export = CreateClient;
}