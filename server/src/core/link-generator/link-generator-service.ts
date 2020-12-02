import { LinkGeneratorService, DonateLinkArgs, LinkShortener } from './types';
import { User } from '../user';
import * as queryString from 'querystring';
import { rethrowIfAppError } from '../error';
import { removePhoneCountryCode } from '../util';

interface LinksArgs { 
  baseUrl: string;
  shortener: LinkShortener
}

export class Links implements LinkGeneratorService {
  private args: LinksArgs;

  constructor(args: LinksArgs) {
    this.args = args;
  }

  async getUserDonateLink(user: User, amount: number, shorten: boolean = true): Promise<string> {
    const { name, email, phone } = user;
    const shortPhone = removePhoneCountryCode(phone);

    try {
      const longLink = await this.getDonateLink({ name, email, phone: shortPhone, amount }, shorten);
      return longLink;
    }
    catch (e) {
      rethrowIfAppError(e);
    }
  }

  async getDonateLink(args: DonateLinkArgs, shorten: boolean = true): Promise<string> {
    const query: any = {};

    if (args.name) {
      query.n = args.name;
    }

    if (args.email) {
      query.e = args.email;
    }

    if (args.phone) {
      query.p = args.phone;
    }

    if (args.amount) {
      query.a = args.amount;
    }

    const encodedQuery = queryString.stringify(query);
    const link = `${this.args.baseUrl}?donate=1&${encodedQuery}`;

    if (shorten) {
      return this.args.shortener.shortenLink(link);
    }

    return link;
  }
}