import { LinkGeneratorService, DonateLinkArgs } from "./types";
import { User } from '../user';
import * as queryString from 'querystring';

interface LinkArgs { 
  baseUrl: string;
}

export class Links implements LinkGeneratorService {
  private args: LinkArgs;

  constructor(args: LinkArgs) {
    this.args = args;
  }

  getUserDonateLink(user: User, amount: number): string {
    const { name, email, phone } = user;
    return this.getDonateLink({ name, email, phone, amount });
  }
  getDonateLink(args: DonateLinkArgs): string {
    const { name, email, phone } = args;
    let amount = args.amount > 2000 ? args.amount : 2000;
    return `${this.args.baseUrl}?donate=true&${queryString.stringify({ n: args.name})}&e=${email}&p=${phone}&a=${amount}`;
  }
}