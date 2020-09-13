import { InitiateDonationArgs, Transaction, AnonymousDonateArgs } from '../types';
import axios from 'axios';
export const Donations = {
  async initiateDonation (args: InitiateDonationArgs) {
    const res = await axios.post<Transaction>('/donations/initiate', args);
    return res.data;
  },
  async initiateAnonymousDonation(args: AnonymousDonateArgs) {
    const res = await axios.post<Transaction>('/donations/anonymous/initiate', args);
    return res.data;
  }
}