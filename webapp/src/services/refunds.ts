import { Transaction } from '../types';
import axios from 'axios';

export const Refunds = {
  async initiateRefund () {
    const res = await axios.post<Transaction>('/refunds/initiate');
    return res.data;
  }
}