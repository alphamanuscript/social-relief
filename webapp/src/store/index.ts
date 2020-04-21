import Vue from 'vue';
import Vuex from 'vuex';
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

export interface Nominator {
  _id: string;
  associatedDonorId: string;
  timestamp: Date;
}
export interface Appointer {
  _id: string;
  associatedDonorId: string;
  timestamp: Date;
}

export interface Beneficiary {
  _id: string;
  phone: string;
  nominatedBy: Nominator[];
  owed: number[];
  receivedThisMonth: number;
}

export interface Middleman {
  _id: string;
  phone: string;
  appointedBy: Appointer[];
}

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
}

export interface Invitation {
  _id: string;
  inviter: string;
  invitee: string;
  code: number;
  generatedLink: string;
  timestamp: Date;
}

interface AppState {
  user?: User;
  beneficiaries: Beneficiary[];
  middlemen: Middleman[];
  transactions: Transaction[];
  invitations: Invitation[];
}

const state: AppState = {
  user: undefined,
  beneficiaries: [],
  middlemen: [],
  transactions: [],
  invitations: []
}

export default new Vuex.Store({
  state,
  mutations: {
    addTransaction(state, trx) {
      state.transactions.push(trx);
    },
    addInvitation(state, invt) {
      state.invitations.push(invt);
    },
    addBeneficiary(state, bnf) {
      state.beneficiaries.push(bnf);
    },
    updateBeneficiary(state, bnf) {
      state.beneficiaries[state.beneficiaries.findIndex(beneficiary => beneficiary._id === bnf._id)] = bnf;
    },
    addMiddleman(state, mdm) {
      state.middlemen.push(mdm);
    },
    updateMiddleman(state, mdm) {
      state.middlemen[state.middlemen.findIndex(middleman => middleman._id === mdm._id)] = mdm;
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
    },
    setInvitations(state, invitations) {
      state.invitations = invitations
    },
    removeInvitation(state, phone) {
      const index = state.invitations.findIndex(invt => invt.invitee === phone);
      if (index > - 1) state.invitations.splice(index, 1); 
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
      return beneficiaries.filter(bnf => {
        if (user) {
          const nominatorIndex = bnf.nominatedBy.findIndex(nominator => nominator._id === user._id);
          return bnf.owed[nominatorIndex];
        }
        return false;
      }).length;
    },
    numberOfBeneficiariesNotOwed: ({ beneficiaries, user }) => {
      return beneficiaries.filter(bnf => {
        if (user) {
          const nominatorIndex = bnf.nominatedBy.findIndex(nominator => nominator._id === user._id);
          return !bnf.owed[nominatorIndex];
        }
        return false;
      }).length;
    },
    totalAmountOwedToBeneficiaries: ({ beneficiaries, user }) => {
      if (user) {
        return beneficiaries.reduce((total, bnf) => { 
          const nominatorIndex = bnf.nominatedBy.findIndex(nominator => nominator._id === user._id);
          return total + bnf.owed[nominatorIndex] 
        }, 0);
      }
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
    async getInvitations({ commit, state}) {
      if (state.user) {
        const invitations = await AccountService.getInvitations(state.user.phone);
        console.log('Inside getInvitations: ', invitations);
        commit('setInvitations', invitations);
      }
    },
    async donate({ commit, state }, { amount }: { amount: number }) {
      if (state.user) {
        const trx = await AccountService.donate(state.user._id, amount);
        const updatedUser = await AccountService.updateUser({
          ...state.user,
          accountBalance: state.user.accountBalance + amount
        });
        commit('addTransaction', trx);
        commit('setUser', updatedUser);
      }
    },
    async nominateBeneficiary({ commit, state }, { nominator, beneficiary }: { nominator: string; beneficiary: string }) {
      if (state.user) {
        const result = await AccountService.getBeneficiary(beneficiary, state.user._id);
        let bnf;
        if (result) {
          bnf = await AccountService.updateBeneficiary({ 
            _id: nominator,
            associatedDonorId: state.user._id,
            timestamp: new Date()
          }, result);
          commit('updateBeneficiary', bnf);
        }
        else {
          bnf = await AccountService.nominateBeneficiary({
            _id: nominator,
            associatedDonorId: state.user._id,
            timestamp: new Date()
          }, beneficiary);
          commit('addBeneficiary', bnf);
        }
        
      }
    },
    async appointMiddleman({ commit, state }, { middleman }: { middleman: string }) {
      if (state.user) {
        const result = await AccountService.getMiddleman(middleman, state.user._id);
        let mdm;
        if (result) {
          mdm = await AccountService.updateMiddleman({ 
            _id: state.user._id,
            associatedDonorId: state.user._id,
            timestamp: new Date()
          }, result);
          commit('updateMiddleman', mdm);
        }
        else {
          mdm = await AccountService.appointMiddleman({
            _id: state.user._id,
            associatedDonorId: state.user._id,
            timestamp: new Date()
          }, middleman);
          commit('addMiddleman', mdm);
        }
        const invt = await AccountService.sendInvitation(state.user, middleman);
        console.log('invt: ', invt);
        commit('addInvitation', invt);
        console.log('state.invitations: ', state.invitations);
      }
    },
    async resendInvitation({ commit, state }, { middleman }: { middleman: string }) {
      if (state.user) {
        const index = state.invitations.findIndex(invt => invt.invitee === middleman);
        console.log('index: ', index);
        console.log('state.invitations: ', state.invitations);
        let invt;
        if (index > - 1) {
          invt = await AccountService.deleteInvitation(state.user, state.invitations[index]._id);
          console.log('deleted invt: ', invt);

          commit('removeInvitation', middleman);
        }

        invt = await AccountService.sendInvitation(state.user, middleman);
        console.log('resent invt: ', invt);
        commit('addInvitation', invt);
      } 
    }
  },
  modules: {
  }
})
