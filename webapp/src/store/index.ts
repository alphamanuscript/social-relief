import Vue from 'vue'
import Vuex from 'vuex'
import { AccountService } from '@/services';

Vue.use(Vuex)

type TransactionType = 'deposit' | 'donation';

export interface User {
  _id: string;
  phone: string;
  email: string;
  accountBalance: number;
  donationBalance: number;
}

export interface Beneficiary {
  _id: string;
  phone: string;
  nominatedBy: string;
  nominatedAt: Date;
}

export interface Middleman {
  _id: string;
  phone: string;
  appointedBy: string;
  appointedAt: Date;
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
}

interface AppState {
  user?: User;
  beneficiaries: Beneficiary[];
  middlemen: Middleman[];
  transactions: Transaction[];
}

const state: AppState = {
  user: undefined,
  beneficiaries: [],
  middlemen: [],
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
    addMiddleman(state, mdm) {
      state.middlemen.push(mdm);
    },
    setUser(state, user) {
      state.user = user
    },
    setBeneficiaries(state, beneficiaries) {
      state.beneficiaries = beneficiaries
    },
    setMiddlemen(state, middlemen) {
      state.middlemen = middlemen
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
    totalAmountDonated: ({ transactions }) => {
      return transactions.filter(t => t.type == 'donation' && t.amount > 0)
        .map(t => t.amount)
        .reduce((a, b) => a + b, 0);
    },
    accountBalance: ({ transactions }) => {
      return transactions.map(t => t.type === 'donation' ? -1 * t.amount : t.amount).reduce((a, b) => a + b, 0);
    },
    peopleDonatedTo: ({ transactions }) => {
      const recipients = transactions.filter(t => t.type === 'donation' && t.to.length)
        .map(t => t.to);
      const uniqueRecipients = new Set(recipients);
      return uniqueRecipients.size;
    },
    donations: ({ transactions }) => {
      return transactions.filter(t => t.type == 'donation');
    }
  },
  actions: {
    async login({ commit}, _id: string) {
      console.log('Logging user in...', _id);
      const user = await AccountService.login(_id);
      console.log('user: ', user);
      commit('setUser', user);
    },
    async getBeneficiaries({ commit}, _id: string) {
      console.log('Getting beneficiaries');
      const beneficiaries = await AccountService.getBeneficiaries(_id);
      console.log('beneficiaries: ', beneficiaries);
      commit('setBeneficiaries', beneficiaries);
    },
    async getMiddlemen({ commit}, _id: string) {
      console.log('Getting middlemen');
      const middlemen = await AccountService.getMiddlemen(_id);
      console.log('middlemen: ', middlemen);
      commit('setMiddlemen', middlemen);
    },
    async getTransactions({ commit}, _id: string) {
      console.log('Getting transactions');
      const transactions = await AccountService.getTransactions(_id);
      console.log('transactions: ', transactions);
      commit('setTransactions', transactions);
    },
    async depositToAccount({ commit }, { user, amount }: { user: User; amount: number }) {
      console.log('Received amount', amount);
      const trx = await AccountService.deposit(user._id, amount);
      const updatedUser = await AccountService.updateUser({
        ...user,
        accountBalance: user.accountBalance + amount
      });
      commit('addTransaction', trx);
      commit('setUser', updatedUser);
    },
    async donate({ commit}, { user, donation }: { user: User; donation: any }) {
      const trx = await AccountService.donate(donation);
      const updatedUser = await AccountService.updateUser({
        ...user,
        donationBalance: user.donationBalance + donation.amount
      });
      commit('addTransaction', trx);
      commit('setUser', updatedUser);
    },
    async nominateBeneficiary({ commit }, { nominator, beneficiary }: { nominator: string; beneficiary: string }) {
      console.log('Nominated beneficiary', beneficiary);
      const bnf = await AccountService.nominateBeneficiary(nominator, beneficiary);
      commit('addBeneficiary', bnf);
    },
    async appointMiddleman({ commit }, { appointer, middleman }: { appointer: string; middleman: string }) {
      console.log('Appointed middleman', middleman);
      const mdm = await AccountService.appointMiddleman(appointer, middleman);
      commit('addMiddleman', mdm);
    }
  },
  modules: {
  }
})
