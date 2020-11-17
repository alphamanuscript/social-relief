import { LinkGeneratorService, DonateLinkArgs } from "./types";
import { BitlyLinkShortener } from './bitly-link-shortener';
import { User } from '../user';
import * as queryString from 'querystring';
import { rethrowIfAppError } from '../error';

interface LinkArgs { 
  baseUrl: string;
  bitly: BitlyLinkShortener
}

export class Links implements LinkGeneratorService {
  private args: LinkArgs;

  constructor(args: LinkArgs) {
    this.args = args;
  }

  async getUserDonateLink(user: User, amount: number): Promise<string> {
    const { name, email, phone } = user;
    try {
      const longLink = this.getDonateLink({ name, email, phone, amount });
      const shortLink = await this.args.bitly.shortenLink(longLink);
      return shortLink;
    }
    catch (e) {
      rethrowIfAppError(e);
    }
  }
  getDonateLink(args: DonateLinkArgs): string {
    const { name, email, phone } = args;
    const amount = args.amount < 2000 ? 2000 : args.amount;
    const nameQuery = queryString.stringify({ n: name}); // n=first%20last
    return `${this.args.baseUrl}?donate=true&${nameQuery}&e=${email}&p=${phone}&a=${amount}`;
  }
}