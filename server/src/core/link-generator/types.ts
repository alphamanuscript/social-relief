import { User } from '../user';

export interface DonateLinkArgs {
  /**
   * name of the donor
   */
  name?: string,
  /**
   * email of the donor
   */
  email?: string,
  /**
   * phone number of the donor (should not include country code)
   */
  phone?: string,
  /**
   * The amount to donate
   */ 
  amount?: number,
  /**
   * Whether to shorten the link using a LinkShortener
   */
  shorten?: boolean
}

export interface LinkGeneratorService {
  /**
   * Generates a donation link for the specified user
   * @param user the user to generate a link for
   * @param amount the amount to donate
   * @param shorten whether to shorten the link (defaults to true)
   */
  getUserDonateLink(user: User, amount: number, shorten?: boolean): Promise<string>;
  /**
   * Generates a donation link with the specified arguments
   * @param args
   * @param shorten whether to shorten link (defaults to true)
   */
  getDonateLink(args: DonateLinkArgs, shorten?: boolean): Promise<string>;
}

export interface LinkShortener {
  shortenLink(link: string): Promise<string>;
}
