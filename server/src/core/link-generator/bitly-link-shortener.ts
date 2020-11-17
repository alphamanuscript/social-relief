import axios from 'axios';
import { rethrowIfAppError, createBitlyApiError, createLinkShorteningFailedError } from '../error';

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

export interface BitlyArgs {
  apiKey: string;
  apiLink: string;
}

export interface LinkShortener {
  shortenLink(link: string): Promise<string>;
}

export class BitlyLinkShortener implements LinkShortener {
  private apiKey: string;
  private apiLink: string;
  private headers: any;

  constructor(args: BitlyArgs) {
    this.apiKey = args.apiKey;
    this.apiLink = args.apiLink;
    this.headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}`};
  }

  async shortenLink(link: string): Promise<string> {
    try {
      const res = await axios.post<ShortenLinkRes>(this.apiLink, { long_url: link }, { headers: this.headers });
      if (res.status === 200 || res.status === 201) {
        return res.data.link;
      }

      throw createLinkShorteningFailedError('Failed to shorten link');
    }
    catch (e) {
      console.log(e);
      rethrowIfAppError(e);
      throw createBitlyApiError(e.message);
    }
  }
}