import { User } from '../user';

export interface BulkMessageService {
  send(recipients: string[], messageTemplate: string): Promise<BulkMessageReport>;
  previewMessage(messageTemplate: string): Promise<string>;
}

export interface MessageContextFactory {
  createContextFromUser(user: User): Promise<MessageTemplateContext>;
}

export interface MessageTemplateResolver {
  resolve(context: MessageTemplateContext, messageTemplate: string): Promise<string>;
}

export interface RecipientResolver {
  canResolve(recipient: string): boolean;
  resolve(recipient: string): Promise<User[]>;
}

export interface BulkMessagesTransport {
  sendMessage(recipient: User, message: string): Promise<void>
}

export interface BulkMessageReport {
  numRecipients: number;
  numFailed: number;
  errors: BulkMessageReportError[];
}

export interface BulkMessageReportError {
  message: string;
  recipientGroup?: string;
  user?: string;
}

export interface MessageTemplateContext {
  [placeholder: string]: string;
  firstName: string;
  donateLink: string;
  baseUrl: string;
}