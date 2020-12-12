import { BatchJobQueue } from '../batch-job-queue';
import { User } from '../user';
import { BulkMessageService, MessageContextFactory, MessageSender, MessageTemplateResolver, RecipientResolver } from './types';

export class BulkMessages implements BulkMessageService {
  recipientResolver: RecipientResolver;
  contextFactory: MessageContextFactory;
  templateResolver: MessageTemplateResolver;
  sender: MessageSender;

  async send(recipientGroups: string[], messageTemplate: string): Promise<void> {
    // we assume we'll have a few recipient groups, but a single group might
    // resolve into many recipients. So we don't use a batch queue here
    const tasks = recipientGroups.map(group => this.sendToRecipientGroup(group, messageTemplate));
    await Promise.all(tasks);
  }

  private async sendToRecipientGroup(recipientGroup: string, messageTemplate: string): Promise<void> {
    const recipients = await this.recipientResolver.resolve(recipientGroup);

    var queue = new BatchJobQueue<User>(recipient => this.sendToRecipient(recipient, messageTemplate));

    recipients.forEach(recipient => queue.push(recipient));
    return queue.run();
  }

  private async sendToRecipient(recipient: User, template: string): Promise<void> {
    const context = await this.contextFactory.createContextFromUser(recipient);
    const message = await this.templateResolver.resolve(context, template);
    return this.sender.sendMessage(recipient, message);
  }

}