import { User } from '../user';

export interface DonateLinkArgs {
  name: string,
  email: string,
  phone: string, 
  amount: number
}

export interface LinkGeneratorService {
  getUserDonateLink(user: User, amount: number): string;
  getDonateLink(args: DonateLinkArgs): string;
}