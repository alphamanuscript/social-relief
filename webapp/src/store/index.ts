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
  role: string;
}

export interface Beneficiary {
  _id: string;
  phone: string;
  nominatedBy: string[];
  nominatedAt: Date;
}

export interface Middleman {
  _id: string;
  phone: string;
  appointedBy: string[];
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
    peopleDonatedTo: ({ transactions, user }) => {
      const recipients = transactions.filter(t => t.type === 'donation' && (t.to.length && user && t.to !== user._id))
        .map(t => t.to);
      const uniqueRecipients = new Set(recipients);
      return uniqueRecipients.size;
    },
    donations: ({ transactions }) => {
      return transactions.filter(t => t.type == 'donation').reverse();
    },
    numberOfBeneficiariesOwed: ({ beneficiaries, user }) => {
      return beneficiaries.filter(async(bnf) => {
        if (user) {
          const beneficiaryTransactions = await AccountService.queryTransactions(user._id, bnf._id);
          return beneficiaryTransactions.length;
        }
        return false;
      }).length;
    },
    numberOfBeneficiariesNotOwed: ({ beneficiaries, user }) => {
      return beneficiaries.filter(async(bnf) => {
        if (user) {
          const beneficiaryTransactions = await AccountService.queryTransactions(user._id, bnf._id);
          return beneficiaryTransactions.length;
        }
        return false;
      }).length;
      // return beneficiaries.filter(bnf => bnf.owed === 0).length;
    },
    totalAmountOwedToBeneficiaries: ({ beneficiaries }) => {
      console.log('beneficiaries: ', beneficiaries);
      return beneficiaries.reduce((total, bnf) => { return total + bnf.owed }, 0);
    }
  },
  actions: {
    async login({ commit}, _id: string) {
      const user = await AccountService.login(_id);
      commit('setUser', user);
    },
    async getBeneficiaries({ commit}, _id: string) {
      const beneficiaries = await AccountService.getBeneficiaries(_id);
      commit('setBeneficiaries', beneficiaries);
    },
    async getMiddlemen({ commit}, _id: string) {
      const middlemen = await AccountService.getMiddlemen(_id);
      commit('setMiddlemen', middlemen);
    },
    async getTransactions({ commit}, _id: string) {
      const transactions = await AccountService.getTransactions(_id);
      commit('setTransactions', transactions);
    },
    async donate({ commit }, { user, amount }: { user: User; amount: number }) {
      const trx = await AccountService.donate(user._id, amount);
      const updatedUser = await AccountService.updateUser({
        ...user,
        accountBalance: user.accountBalance + amount
      });
      commit('addTransaction', trx);
      commit('setUser', updatedUser);
    },
    async nominateBeneficiary({ commit }, { nominator, beneficiary }: { nominator: string; beneficiary: string }) {
      const bnf = await AccountService.nominateBeneficiary(nominator, beneficiary);
      commit('addBeneficiary', bnf);
    },
    async appointMiddleman({ commit }, { appointer, middleman }: { appointer: string; middleman: string }) {
      const mdm = await AccountService.appointMiddleman(appointer, middleman);
      commit('addMiddleman', mdm);
    },
    // async getNumberOfBeneficiariesOwed({ state }) {
    //   return state.beneficiaries.filter(async (bnf) => {
    //     await AccountService.queryTransactions().length
    //   }).length;
    // },
  },
  modules: {
  }
})
