import { LinkGeneratorService, DonateLinkArgs } from "./types";
import { User } from '../user';
import * as queryString from 'querystring';
import { Bitly } from "./bitly-service";
import { rethrowIfAppError } from '../error';

interface LinkArgs { 
  baseUrl: string;
  bitly: Bitly
}

export class Links implements LinkGeneratorService {
  private args: LinkArgs;

  constructor(args: LinkArgs) {
    this.args = args;
  }

  async getUserDonateLink(user: User, amount: number): Promise<string> {
    const { name, email, phone } = user;
    try {
      const shortenLink = await this.args.bitly.shortenLink(this.getDonateLink({ name, email, phone, amount }));
      return shortenLink;
    }
    catch (e) {
      rethrowIfAppError(e);
    }
  }
  getDonateLink(args: DonateLinkArgs): string {
    const { name, email, phone } = args;
    const amount = args.amount < 2000 ? 2000 : args.amount;
    return `${this.args.baseUrl}?donate=true&${queryString.stringify({ n: name})}&e=${email}&p=${phone}&a=${amount}`;
  }
}