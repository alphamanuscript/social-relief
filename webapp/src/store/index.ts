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
    async getUser({ commit}, { userId}: { userId: string }) {
      console.log('Getting user', userId);
      const user = await AccountService.getUser(userId);
      commit('setUser', user);
    },
    async getBeneficiaries({ commit}, { accountId }: { accountId: string }) {
      console.log('Getting beneficiaries');
      const beneficiaries = await AccountService.getBeneficiaries(accountId);
      commit('setBeneficiaries', beneficiaries);
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
