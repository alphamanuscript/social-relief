import { User } from '../user';

export interface DonateLinkArgs {
  name: string,
  email: string,
  phone: string, 
  amount: number
}

export interface DeepLink {
  guid: string,
  bitlink: string,
  app_uri_path: string,
  install_url: string,
  app_guid: string,
  os: string,
  install_type: string,
  created: string,
  modified: string,
  brand_guid: string
}

export interface ShortenLinkRes {
  references: any,
  link: string,
  id: string,
  long_url: string,
  title: string,
  archived: boolean,
  created_at: string,
  created_by: string,
  client_id: string,
  custom_bitlinks: string[],
  tags: string[],
  deepLinks: DeepLink[]
}

export interface LinkGeneratorService {
  getUserDonateLink(user: User, amount: number): Promise<string>;
  getDonateLink(args: DonateLinkArgs): string;
}

export interface BitlyService {
  shortenLink(link: string): Promise<string>;
}