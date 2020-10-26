import { wrapActions, googleSignOut } from './util';
import { Users, Transactions, Donations, Refunds, Invitations, Statistics } from '../services';
import router from '../router';
import { DEFAULT_SIGNED_IN_PAGE, DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
import { NominationRole } from '@/types';
import { formatWithCommaSeparator } from '@/views/util';
import { AnonymousUser } from '@/services';

const actions = wrapActions({
  async getStats({commit}) {
    const stats = await Statistics.getStats();
    commit('setStats', stats);
  },
  async getBeneficiaries({ commit }) {
    const beneficiaries = await Users.getBeneficiaries();
    commit('setBeneficiaries', beneficiaries);
  },
  async getMiddlemen({ commit }) {
    const middlemen = await Users.getMiddlemen();
    commit('setMiddlemen', middlemen);
  },
  async getTransactions({ commit, state }) {
    let transactions;
    if (state.user) {
      transactions = await Transactions.getTransactions();
    }
    else if (state.anonymousUser) {
      transactions = await Transactions.getTransactionsForAnonymous(state.anonymousUser);
    }
    
    commit('setTransactions', transactions);
  },
  async getInvitations({ commit}) {
    const invitations = await Invitations.getInvitations();
    commit('setInvitations', invitations);
  },
  async acceptInvitation({ commit}, id: string) {
    const invitation = await Invitations.acceptInvitation(id);
    commit('updateInvitation', invitation);
  },
  async rejectInvitation({ commit}, id: string) {
    const invitation = await Invitations.rejectInvitation(id);
    commit('updateInvitation', invitation);
  },
  async assumeNewRole({ commit }, invitationId: string) {
    const updatedUser = await Users.createNewUserOrAssumeNewRole(invitationId);
    commit('setUser', updatedUser);
  },
  async createNewUser({ commit }, invitationId: string) {
    const newUser = await Users.createNewUserOrAssumeNewRole(invitationId);
    commit('setNewUser', newUser);
  },
  async getNewUser({ commit }, userId: string) {
    const newUser = await Users.getUser(userId);
    commit('setNewUser', newUser);
  },
  async updateNewUser({ commit, state }, { name, email, password, googleIdToken }: { userId: string; name: string; email: string; password: string; googleIdToken: string}) {
    if (state.newUser) {
      const updatedUser = await Users.updateUser(state.newUser._id, { name, email, password });
      const { phone } = state.newUser;
      await Users.login({ phone, password, googleIdToken });
      commit('setUser', updatedUser);
      
      if (updatedUser) {
        router.push({ name: DEFAULT_SIGNED_IN_PAGE });
      }
    }
  },
  async getTransaction({ commit, state }, id: string) {
    let transaction;
    if (state.user) {
      transaction = await Transactions.getTransaction(id);
    }
    else if (state.anonymousUser) {
      transaction = await Transactions.getTransactionForAnonymous(id, state.anonymousUser._id);
    }
    commit('updateTransaction', transaction);
  },
  async getCurrentInvitation({ commit }, id: string) {
    const invitation = await Invitations.getInvitation(id);
    commit('updateInvitation', invitation);
    commit('setCurrentInvitation', invitation);
  },
  async donate({ commit, state }, { amount }: { amount: number }) {
    if (state.user) {
      const trx = await Donations.initiateDonation({ amount });
      commit('addTransaction', trx);
      commit('setPaymentRequest', trx);
    }   
  },
  async donateAnonymously({ commit }, { amount, name, phone, email}: {amount: number; name: string; phone: string; email: string }) {
    const trx = await Donations.initiateAnonymousDonation({ amount, name, phone, email });
    if (trx) {
      const anonymousUser = await Users.getAnonymousUser(trx.to);
      commit('setAnonymousUser', anonymousUser);
      commit('setPaymentRequest', trx);
    }
    
  },
  async setAnonymousDonationDetails({ commit }, { name, phone, email, amount }: {amount: number; name?: string; phone?: string; email?: string }) {
    commit('setAnonymousDonationDetails', { name, phone, email, amount });
  },
  async initiateRefund({ commit, state }) {
    if (state.user) {
      const trx = await Refunds.initiateRefund();
      commit('addTransaction', trx);
      commit('setMessage', {
        type: 'success',
        message: `A refund of Ksh ${formatWithCommaSeparator(trx.expectedAmount)} has been successfully initiated.`
      });
    }
  },
  async nominate({ commit, state}, { nominee, name, email, role }: { nominee: string; name: string; email: string; role: NominationRole }) {
    if (state.user) {
      const invitation = await Users.nominate({ phone: nominee, name, email, role, nominatorId: state.user._id, nominatorName: state.user.name });
      commit('addInvitation', invitation);
    }
  },
  /**
   * Valid combinations for creating a user: 
   * createUser({phone, password}) OR
   * createUser({phone, googleIdToken})
   */
  async createUser({ commit }, { name, phone, password, email, googleIdToken }: { name: string; phone: string; password: string; email: string; googleIdToken: string }) {
    const user = await Users.createUser({ name, phone, password, email, googleIdToken });
    await Users.login({ phone, password, googleIdToken });
    commit('setUser', user);

    if (user) {
      router.push({ name: DEFAULT_SIGNED_IN_PAGE });
    }
  },
   /**
   * Valid combinations for signing a user in:
   * signUserin({phone, password}) OR
   * signUserin({googleIdToken})
   */
  async signUserIn({ commit }, { phone, password, googleIdToken }: { phone: string; password: string; googleIdToken: string }) {
    const user = await Users.login({ phone, password, googleIdToken });
    if (user) {
      commit('setUser', user);
      if (router.currentRoute.name !== DEFAULT_SIGNED_IN_PAGE ) router.push({ name: DEFAULT_SIGNED_IN_PAGE });
    }
  },
  async signUserOut({ dispatch }) {
    await Users.logout();
    await googleSignOut();
    dispatch('clearData');
    router.push({ name: DEFAULT_SIGNED_OUT_PAGE });
  },
  async getCurrentUser({ commit }) {
    const user = await Users.getCurrentUser();
    if (user) commit('setUser', user);
  },
  async getCurrentAnonymousUser({ commit }) {
    const userData = AnonymousUser.getUserData();
    if (userData) {
      commit('setAnonymousUser', userData);
    } 
  },
  async refreshData({ dispatch }) {
    [
      'getBeneficiaries',
      'getMiddlemen',
      'getTransactions',
      'getInvitations'
    ].forEach((action) => dispatch(action));
  },
  async resetMessage({ commit }) {
    commit('unsetMessage');
  },
  async clearData({ commit }) {
    [
      'unsetUser',
      'unsetBeneficiaries',
      'unsetMiddlemen',
      'unsetTransactions',
      'unsetInvitations',
      'unsetCurrentInvitation',
      'unsetLastPaymentRequest',
      'unsetMessage',
      'unsetStats',
    ].forEach((mutation) => commit(mutation));
  }
});

export default actions;