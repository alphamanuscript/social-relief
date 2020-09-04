import axios from 'axios';
import {
  User,
  Transaction,
  AnonymousCreateArgs,
  AnonymousDonateArgs
} from '../types';

export const Anonymous = {
  async create(args: AnonymousCreateArgs) {
    const res = await axios.post<User>('/anonymous/create', args);
    return res.data;
  },
  async donate(args: AnonymousDonateArgs) {
    const res = await axios.post<Transaction>('/anonymous/donate', args);
    return res.data;
  }
}