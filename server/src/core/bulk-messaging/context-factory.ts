import { LinkGeneratorService } from '../link-generator';
import { User } from '../user';
import { extractFirstName } from '../util';
import { MessageContextFactory, MessageTemplateContext } from './types';

const DEFAULT_DONATION = 2000;

export interface DefaultMessageContextFactoryArgs {
  linkGenerator: LinkGeneratorService;
  baseUrl: string;
}

export class DefaultMessageContextFactory implements MessageContextFactory {
  linkGenerator: LinkGeneratorService;
  baseUrl: string;

  constructor(args: DefaultMessageContextFactoryArgs) {
    this.linkGenerator = args.linkGenerator;
    this.baseUrl = args.baseUrl;
  }

  async createContextFromUser(user: User): Promise<MessageTemplateContext> {
    return {
      firstName: extractFirstName(user.name),
      baseUrl: this.baseUrl,
      donateLink: await this.linkGenerator.getUserDonateLink(user, DEFAULT_DONATION)
    };
  }
}