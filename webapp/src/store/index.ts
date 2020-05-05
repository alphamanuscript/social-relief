import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex)

type TransactionType = 'deposit' | 'donation';

export interface Token {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  user: string;
}

export interface LoginResult {
  user: User;
  token: Token;
}

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

export interface AppState {
  user?: User;
  beneficiaries: Beneficiary[];
  middlemen: Middleman[];
  transactions: Transaction[];
  invitations: Invitation[];
  invitation?: Invitation;
}

const state: AppState = {
  user: undefined,
  beneficiaries: [],
  middlemen: [],
  transactions: [],
  invitations: [],
  invitation: undefined,
}

const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions
});

export default store;
