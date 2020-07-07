import { InitiateDonationArgs, Transaction } from '../types';
import axios from 'axios';
export const Donations = {
  async initiateDonation (args: InitiateDonationArgs) {
    console.log('args.amount: ', typeof args.amount);
    const res = await axios.post<Transaction>('/donations/initiate', args);
    return res.data;
  }
}