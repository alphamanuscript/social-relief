import { User } from '../user';

export interface DonateLinkArgs {
  name: string,
  email: string,
  phone: string, 
  amount: number
}

export interface LinkGeneratorService {
  getUserDonateLink(user: User, amount: number): Promise<string>;
  getDonateLink(args: DonateLinkArgs): string;
}