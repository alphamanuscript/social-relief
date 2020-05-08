import { MutationTree } from 'vuex';
import { AppState } from '../types';

const mutations: MutationTree<AppState> = {
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
  unsetUser(state) {
    state.user = undefined
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
  removeInvitation(state, phone) {
    const index = state.invitations.findIndex(invt => invt.invitee === phone);
    if (index > - 1) state.invitations.splice(index, 1); 
  },
  setInvitation(state, invitation) {
    state.invitation = invitation
  },
  setMessage(state, message) {
    state.message = message
  },
  unsetMessage(state) {
    state.message = { type: '', message: '' }
  }
};

export default mutations;