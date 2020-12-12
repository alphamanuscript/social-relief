import { User } from '../user';

export interface BulkMessageService {
  send(recipients: string[], messageTemplate: string): Promise<void>;
}

export interface MessageTemplateContext {
  [placeholder: string]: string;
  firstName: string;
  donateLink: string;
  baseUrl: string;
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

export interface MessagePlaceholderResolver {
  canResolve(placeholder: string): boolean;
  resolve(placeholder: string): Promise<string>;
}

export interface TemplateValidator {
  validate(messageTemplate: string): boolean;
}

export interface MessageSender {
  sendMessage(recipient: User, message: string): Promise<void>
}