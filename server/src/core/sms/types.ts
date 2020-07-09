export type SendStatus = 'Success' | 'Failed';

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
  status: SendStatus;
  messageId: string;
}

export interface SMSProvider {
  sendMessageToUser(user: string, message: string): Promise<SendResult>;
}