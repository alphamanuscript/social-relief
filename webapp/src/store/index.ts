import Vue from 'vue'
import Vuex from 'vuex'
import { AccountService } from '@/services';

Vue.use(Vuex)

type TransactionType = 'deposit' | 'donation';

interface User {
  userId: string;
  accountId: string;
  phone: string;
  email: string;
}

interface Beneficiary {
  _id: string;
  phone: string;
  nominatedBy: string;
}

interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
}

interface AppState {
  user?: User;
  beneficiaries: Beneficiary[];
  transactions: Transaction[];
}

const state: AppState = {
  user: undefined,
  beneficiaries: [],
  transactions: []
}

export default new Vuex.Store({
  state,
  mutations: {
    addTransaction(state, trx) {
      state.transactions.push(trx);
    },
    addBeneficiary(state, bnf) {
      state.beneficiaries.push(bnf);
    },
    setUser(state, user) {
      state.user = user
    },
    setBeneficiaries(state, beneficiaries) {
      state.beneficiaries = beneficiaries
    },
    setTransactions(state, transactions) {
      state.transactions = transactions
    }
  },
  getters: {
    amountDeposited: ({ transactions }) => {
      return transactions.filter(t => t.type == 'deposit' && t.amount > 0)
        .map(t => t.amount)
        .reduce((a, b) => a + b, 0);
    },
    amountDonated: ({ transactions }) => {
      return transactions.filter(t => t.type == 'donation' && t.amount > 0)
        .map(t => t.amount)
        .reduce((a, b) => a + b, 0);
    },
    accountBalance: ({ transactions }) => {
      return transactions.map(t => t.type === 'donation' ? -1 * t.amount : t.amount).reduce((a, b) => a + b, 0);
    },
    peopleDonatedTo: ({ transactions }) => {
      const recipients = transactions.filter(t => t.type == 'donation')
        .map(t => t.to);
      const uniqueRecipients = new Set(recipients);
      return uniqueRecipients.size;
    },
    donations: ({ transactions }) => {
      return transactions.filter(t => t.type == 'donation');
    }
  },
  actions: {
    async login({ commit}, userId: string) {
      console.log('Logging user in...', userId);
      const user = await AccountService.login(userId);
      console.log('user: ', user);
      commit('setUser', user);
    },
    async getBeneficiaries({ commit}, accountId: string) {
      console.log('Getting beneficiaries');
      const beneficiaries = await AccountService.getBeneficiaries(accountId);
      console.log('beneficiaries: ', beneficiaries);
      commit('setBeneficiaries', beneficiaries);
    },
    async getTransactions({ commit}, accountId: string) {
      console.log('Getting transactions');
      const transactions = await AccountService.getTransactions(accountId);
      console.log('transactions: ', transactions);
      commit('setTransactions', transactions);
    },
    async depositToAccount({ commit }, { accountId, amount }: { accountId: string; amount: number }) {
      console.log('Received amount', amount);
      const trx = await AccountService.deposit(accountId, amount);
      commit('addTransaction', trx);
    },
    async nominateBeneficiary({ commit }, { accountId, beneficiary }: { accountId: string; beneficiary: string }) {
      console.log('Nominated beneficiary', beneficiary);
      const bnf = await AccountService.nominateBeneficiary(accountId, beneficiary);
      commit('addBeneficiary', bnf);
    }
  },
  modules: {
  }
})
