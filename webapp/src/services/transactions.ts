import { Transaction, User } from '../types';
import axios from 'axios';

export const Transactions = {
  async getTransactions() {
    const res = await axios.get<Transaction[]>('/transactions');
    return res.data;
  },
  async getTransactionsForAnonymous(anonymousUser: User) {
    const res = await axios.get<Transaction[]>(`/transactions/anonymous/${anonymousUser._id}`);
    return res.data;
  },
  async getTransaction(transactionId: string) {
    const res = await axios.get<Transaction>(`/transactions/${transactionId}`);
    return res.data;
  },
  async getTransactionForAnonymous(transactionId: string, anonymousUser: User) {
    const res = await axios.get<Transaction>(`/transactions/${transactionId}/anonymous/${anonymousUser._id}`);
    return res.data;
  }
}