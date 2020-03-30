import Vue from 'vue'
import Vuex from 'vuex'
import { AccountService } from '@/services';

Vue.use(Vuex)

type TransactionType = 'deposit' | 'donation';

interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
}

export default new Vuex.Store({
  state: {
    user: {
      _id: 'userid',
      accountId: 'acc1',
      transactions: [
        {
          _id: 'tx1',
          type: 'deposit',
          amount: 1000,
          from: '',
          to: 'acc1'
        },
        {
          _id: 'tx2',
          type: 'deposit',
          amount: 500,
          from: '',
          to: 'acc1'
        },
        {
          _id: 'tx3',
          type: 'donation',
          amount: 1000,
          from: 'acc1',
          to: 'acc2'
        },
        {
          _id: 'tx4',
          type: 'deposit',
          amount: 6000,
          from: '',
          to: 'acc1'
        },
        {
          _id: 'tx5',
          type: 'donation',
          amount: 1000,
          from: 'acc1',
          to: 'acc2'
        },
        {
          _id: 'tx6',
          type: 'donation',
          amount: 500,
          from: 'acc1',
          to: 'acc3'
        },
      ] as Transaction[]
    }
  },
  mutations: {
    addTransaction(state, trx) {
      state.user.transactions.push(trx);
    }
  },
  getters: {
    amountDeposited: ({ user: { transactions } }) => {
      return transactions.filter(t => t.type == 'deposit' && t.amount > 0)
        .map(t => t.amount)
        .reduce((a, b) => a + b, 0);
    },
    amountDonated: ({ user: { transactions } }) => {
      return transactions.filter(t => t.type == 'donation' && t.amount > 0)
        .map(t => t.amount)
        .reduce((a, b) => a + b, 0);
    },
    accountBalance: ({ user: { transactions } }) => {
      return transactions.map(t => t.amount).reduce((a, b) => a + b, 0);
    },
    peopleDonatedTo: ({ user: { transactions } }) => {
      const recipients = transactions.filter(t => t.type == 'donation')
        .map(t => t.to);
      const uniqueRecipients = new Set(recipients);
      return uniqueRecipients.size;
    },
    donations: ({ user: { transactions } }) => {
      return transactions.filter(t => t.type == 'donation');
    }
  },
  actions: {
    async depositToAccount({ state, commit }, { amount }: { amount: number }) {
      console.log('Received amount', amount);
      const trx = await AccountService.deposit(state.user.accountId, amount);
      commit('addTransaction', trx);
    }
  },
  modules: {
  }
})
