import { MutationTree } from 'vuex';
import { AppState } from './';

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
  },
  setInvitation(state, invitation) {
    state.invitation = invitation
  }
};

export default mutations;