import { BitlyService, ShortenLinkRes } from './types';
import axios from 'axios';
import { rethrowIfAppError, createBitlyApiError, createLinkShorteningFailedError } from '../error';

export interface BitlyArgs {
  apiKey: string;
  apiLink: string;
}

export class Bitly implements BitlyService {
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
      console.log('res.data.link: ', res.data.link);
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