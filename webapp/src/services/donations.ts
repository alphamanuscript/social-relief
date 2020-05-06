import { InitiateDonationArgs, Transaction } from '../types';
import axios from 'axios';
export const Donations = {
  async initiateDonation (args: InitiateDonationArgs) {
    const res = await axios.post<Transaction>('/donations/initiate', args);
    return res.data;
  }
}