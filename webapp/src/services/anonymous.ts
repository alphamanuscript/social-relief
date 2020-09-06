import axios from 'axios';
import {
  Transaction,
  AnonymousDonateArgs
} from '../types';

export const Anonymous = {
  async donate(args: AnonymousDonateArgs) {
    const res = await axios.post<Transaction>('/anonymous/donate', args);
    return res.data;
  }
}