import { User } from '../user';

/**
 * Sends a bulk message to many users based on a single
 * message template.
 */
export interface BulkMessageService {
  /**
   * Sends message to all recipients based on the specified template.
   * Each recipient receives a personalized version of the message.
   * @param recipients List of recipient. A recipient may be a valid phone number (2547xxxxxxxx) or a group like 'donors' or 'beneficiaries'
   * @param messageTemplate A template of the message to send. It may contain placeholders like {firstName}, {donateLink}, or {baseUrl}
   * @returns a report object with information such as number of recipients and errors that occurred
   */
  send(recipients: string[], messageTemplate: string): Promise<BulkMessageReport>;
  /**
   * Previews what the message would look like after it has been personalized
   * for a (dummy) user. This should you confirm that the message template
   * is correct before sending it out.
   * @param messageTemplate A template of the message to send. It may contain placeholders like {firstName}, {donateLink}, or {baseUrl}
   */
  previewMessage(messageTemplate: string): Promise<string>;
}

/**
 * Creates a message context that's used by the `MessageTemplateResolver` to
 * personalize message templates
 */
export interface MessageContextFactory {
  /**
   * Creates a message context with values from the specified user
   * @param user 
   */
  createContextFromUser(user: User): Promise<MessageTemplateContext>;
}

/**
 * Personalizes messages for a given user by replacing
 * placeholders in a template with actual values
 */
export interface MessageTemplateResolver {
  /**
   * Personalize the message template by replacing its placeholders
   * with values from the given context
   * @param context 
   * @param messageTemplate 
   */
  resolve(context: MessageTemplateContext, messageTemplate: string): Promise<string>;
}

/**
 * Finds users that correspond to a given recipient group
 */
export interface RecipientResolver {
  /**
   * Checks whether this resolver knows how to handle the specified recipient
   * @param recipient
   */
  canResolve(recipient: string): boolean;
  /**
   * Returns that users that match the specified recipient group
   * @param recipient 
   */
  resolve(recipient: string): Promise<User[]>;
}

/**
 * Used by the `BulkMessageService` to transport
 * a message to a user
 */
export interface BulkMessagesTransport {
  /**
   * Sends the specified message to the specified user
   * @param recipient 
   * @param message 
   */
  sendMessage(recipient: User, message: string): Promise<void>
}

/**
 * Contains information about a bulk messaging
 * process
 */
export interface BulkMessageReport {
  /**
   * The number of users to whom a message was successfuly sent
   */
  numRecipients: number;
  /**
   * The number of errors that occurred
   */
  numFailed: number;
  /**
   * Information about each error
   */
  errors: BulkMessageReportError[];
}

export interface BulkMessageReportError {
  /**
   * Error message
   */
  message: string;
  /**
   * The recipientGroup that was being processed when this error occurred
   */
  recipientGroup?: string;
  /**
   * The error that a message was being sent to when this error occurred
   */
  user?: string;
}

/**
 * Contains data used to personalize a message template
 */
export interface MessageTemplateContext {
  [placeholder: string]: string;
  firstName: string;
  donateLink: string;
  baseUrl: string;
}