import { MutationTree } from 'vuex';
import { AppState } from '../types';

const mutations: MutationTree<AppState> = {
  addTransaction(state, trx) {
    state.transactions.push(trx);
  },
  addInvitation(state, invt) {
    state.invitations.push(invt);
  },
  updateTransaction(state, trx) {
    const index = state.transactions.findIndex(tx => tx._id === trx._id);
    if (index > -1) {
      // update transactions if already exists
      state.transactions[index] = trx;
    }
    else {
      state.transactions.push(trx);
    }
  },
  updateInvitation(state, invt) {
    const index = state.invitations.findIndex(inv => inv._id === invt._id);
    if (index > -1) {
      // update invitations if already exists
      state.invitations[index] = invt;
    }
    else {
      state.invitations.push(invt);
    }
  },
  setPaymentRequest(state, trx) {
    state.lastPaymentRequest = trx;
  },
  unsetLastPaymentRequest(state) {
    state.lastPaymentRequest = undefined;
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
    state.user = user;
  },
  unsetUser(state) {
    state.user = undefined
  },
  setNewUser(state, newUser) {
    state.newUser = newUser;
  },
  unsetNewUser(state) {
    state.newUser = undefined
  },
  setCurrentInvitation(state, currentInvitation) {
    state.currentInvitation = currentInvitation;
  },
  unsetCurrentInvitation(state) {
    state.currentInvitation = undefined
  },
  setBeneficiaries(state, beneficiaries) {
    state.beneficiaries = beneficiaries
  },
  unsetBeneficiaries(state) {
    state.beneficiaries = []
  },
  setMiddlemen(state, middlemen) {
    state.middlemen = middlemen
  },
  unsetMiddlemen(state) {
    state.middlemen = []
  },
  setTransactions(state, transactions) {
    state.transactions = transactions
  },
  unsetTransactions(state) {
    state.transactions = []
  },
  setInvitations(state, invitations) {
    state.invitations = invitations
  },
  unsetInvitations(state) {
    state.invitations = []
  },
  setMessage(state, message) {
    state.message = message
  },
  unsetMessage(state) {
    state.message = { type: '', message: '' }
  }
};

export default mutations;