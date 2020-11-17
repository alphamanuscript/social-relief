import { LinkGeneratorService, DonateLinkArgs } from "./types";
import { LinkShortener } from './bitly-link-shortener';
import { User } from '../user';
import * as queryString from 'querystring';
import { rethrowIfAppError } from '../error';

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
    try {
      const longLink = this.getDonateLink({ name, email, phone, amount });
      if (shorten) {
        const shortLink = await this.args.shortener.shortenLink(longLink);
        return shortLink;
      }
      return longLink;
    }
    catch (e) {
      rethrowIfAppError(e);
    }
  }
  getDonateLink(args: DonateLinkArgs): string {
    const { name, email, phone, amount } = args;
    const nameQuery = queryString.stringify({ n: name}); // n=first%20last
    return `${this.args.baseUrl}?donate=true&${nameQuery}&e=${email}&p=${phone}&a=${amount}`;
  }
}