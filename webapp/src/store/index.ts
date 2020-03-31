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
      ] as Transaction[],
      beneficiaries: [
        {
          _id: 'acc2',
          phone: '705975787'
        },
        {
          _id: 'acc3',
          phone: '711153086'
        },
        {
          _id: 'acc4',
          phone: '726166685'
        },
      ]
    },
  },
  mutations: {
    addTransaction(state, trx) {
      state.user.transactions.push(trx);
    },
    addBeneficiary(state, bnf) {
      state.user.beneficiaries.push(bnf);
    },
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
      return transactions.map(t => t.type === 'donation' ? -1 * t.amount : t.amount).reduce((a, b) => a + b, 0);
    },
    peopleDonatedTo: ({ user: { transactions } }) => {
      const recipients = transactions.filter(t => t.type == 'donation')
        .map(t => t.to);
      const uniqueRecipients = new Set(recipients);
      return uniqueRecipients.size;
    },
    donations: ({ user: { transactions } }) => {
      return transactions.filter(t => t.type == 'donation');
    },
    beneficiaries: ({ user: { beneficiaries } }) => {
      return beneficiaries
    }
  },
  actions: {
    async depositToAccount({ state, commit }, { amount }: { amount: number }) {
      console.log('Received amount', amount);
      const trx = await AccountService.deposit(state.user.accountId, amount);
      commit('addTransaction', trx);
    },
    async nominateBeneficiary({ state, commit }, { beneficiary }: { beneficiary: string }) {
      console.log('Nominated beneficiary', beneficiary);
      const bnf = await AccountService.nominateBeneficiary(state.user.accountId, beneficiary);
      commit('addBeneficiary', bnf);
    }
  },
  modules: {
  }
})
