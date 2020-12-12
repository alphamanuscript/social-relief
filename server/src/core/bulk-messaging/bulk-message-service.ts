import { BatchJobQueue } from '../batch-job-queue';
import { createAppError, createValidationError } from '../error';
import { User, UserService } from '../user';
import { DefaultRecipientResolver } from './recipient-resolver';
import { DefaultMessageTemplateResolver } from './template-resolver';
import { BulkMessageReport, BulkMessageService, MessageContextFactory, BulkMessagesTransport, MessageTemplateResolver, RecipientResolver } from './types';

export interface BulkMessagesArgs {
  contextFactory: MessageContextFactory;
  templateResolver?: MessageTemplateResolver;
  transport: BulkMessagesTransport;
  recipientResolver?: RecipientResolver;
  users?: UserService
}

export class BulkMessages implements BulkMessageService {
  recipientResolver: RecipientResolver;
  contextFactory: MessageContextFactory;
  templateResolver: MessageTemplateResolver;
  transport: BulkMessagesTransport;

  constructor(args: BulkMessagesArgs) {
    if (!args.recipientResolver && !args.users) {
      throw createAppError('Bulk message args must provide either recipientsResolver or users')
    }

    this.contextFactory = args.contextFactory;
    this.templateResolver = args.templateResolver || new DefaultMessageTemplateResolver();
    this.recipientResolver = args.recipientResolver || new DefaultRecipientResolver({ users: args.users });
    this.transport = args.transport;
  }

  async send(recipientGroups: string[], messageTemplate: string): Promise<BulkMessageReport> {
    // validate recipients
    const invalidGroups = recipientGroups.filter(group => !this.recipientResolver.canResolve(group));
    if (invalidGroups.length) {
      throw createValidationError(`Invalid recipients: ${invalidGroups.map(g => `'${g}'`).join(', ')}`);
    }

    const report: BulkMessageReport = {
      errors: [],
      numFailed: 0,
      numRecipients: 0
    };

    const allRecipients = await this.getRecipients(recipientGroups, report);
    await this.sendToRecipients(allRecipients, messageTemplate, report);

    return report;
  }

  async previewMessage(messageTemplate: string): Promise<string> {
    // create a dummy user and generate a preview message
    // based on that user

    const user: User = {
      _id: 'dummy_user',
      phone: '254700000000',
      name: 'John Doe',
      donors: [],
      roles: ['donor'],
      addedBy: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const message = await this.createMessageForUser(user, messageTemplate);
    return message;
  }

  private async getRecipients(recipientGroups: string[], report: BulkMessageReport): Promise<User[]> {
    const allRecipients: User[] = [];
    const recipientIds: Set<string> = new Set<string>();
    const tasks = recipientGroups.map(group => this.addRecipientsFromGroup(group, allRecipients, recipientIds, report));
    await Promise.all(tasks);
    return Array.from(allRecipients);
  }

  private async addRecipientsFromGroup(group: string, allRecipients: User[], recipientIds: Set<string>, report: BulkMessageReport) {
    try {
      const recipients = await this.recipientResolver.resolve(group);
      recipients.forEach(r => {
        if (!recipientIds.has(r._id)) {
          allRecipients.push(r);
          recipientIds.add(r._id);
        }
      });
    }
    catch (e) {
      report.errors.push({
        recipientGroup: group,
        user: null,
        message: e.message
      });

      report.numFailed += 1;
    }
  }

  private async sendToRecipients(recipients: User[], messageTemplate: string, report: BulkMessageReport): Promise<void> {
    var queue = new BatchJobQueue<User>(recipient => this.sendToRecipient(recipient, messageTemplate, report));

    recipients.forEach(recipient => queue.push(recipient));
    queue.signalEof();
    await queue.run();
  }

  private async sendToRecipient(recipient: User, template: string, report: BulkMessageReport): Promise<void> {
    try {
      const message = await this.createMessageForUser(recipient, template);
      await this.transport.sendMessage(recipient, message);
      report.numRecipients += 1;
    }
    catch (e) {
      report.errors.push({
        message: e.message,
        user: recipient._id,
      });

      report.numFailed += 1;
    }
  }

  private async createMessageForUser(user: User, template: string): Promise<string> {
    const context = await this.contextFactory.createContextFromUser(user);
    const message = await this.templateResolver.resolve(context, template);
    return message;
  }

}