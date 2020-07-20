import { Transaction } from '../types';
import axios from 'axios';

export const Transactions = {
  async getTransactions() {
    const res = await axios.get<Transaction[]>('/transactions');
    return res.data;
  },
  async getTransaction(transactionId: string) {
    const res = await axios.get<Transaction>(`/transactions/${transactionId}`);
    return res.data;
  }
}