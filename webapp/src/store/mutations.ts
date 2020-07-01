import { MutationTree } from 'vuex';
import { AppState } from '../types';

const mutations: MutationTree<AppState> = {
  addTransaction(state, trx) {
    state.transactions.push(trx);
  },
  addBeneficiary(state, bnf) {
    state.beneficiaries.push(bnf);
  },
  addMiddleman(state, mdn) {
    state.middlemen.push(mdn);
  },
  updateBeneficiary(state, bnf) {
    state.beneficiaries[state.beneficiaries.findIndex(beneficiary => beneficiary._id === bnf._id)] = bnf;
  },
  setUser(state, user) {
    state.user = user
  },
  unsetUser(state) {
    state.user = undefined
  },
  setBeneficiaries(state, beneficiaries) {
    state.beneficiaries = beneficiaries
  },
  unsetBeneficiaries(state) {
    state.beneficiaries = []
  },
  setTransactions(state, transactions) {
    state.transactions = transactions
  },
  unsetTransactions(state) {
    state.transactions = []
  },
  setMessage(state, message) {
    state.message = message
  },
  unsetMessage(state) {
    state.message = { type: '', message: '' }
  }
};

export default mutations;