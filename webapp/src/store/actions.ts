import { wrapActions, googleSignOut } from './util';
import { Users, Transactions, Donations, Invitations } from '../services';
import router from '../router';
import { DEFAULT_SIGNED_IN_PAGE, DEFAULT_SIGNED_OUT_PAGE } from '../router/defaults';
import { NominationRole } from '@/types';

const actions = wrapActions({
  async getBeneficiaries({ commit }) {
    const beneficiaries = await Users.getBeneficiaries();
    commit('setBeneficiaries', beneficiaries);
  },
  async getMiddlemen({ commit }) {
    const middlemen = await Users.getMiddlemen();
    commit('setMiddlemen', middlemen);
  },
  async getTransactions({ commit}) {
    const transactions = await Transactions.getTransactions();
    commit('setTransactions', transactions);
  },
  async getInvitations({ commit}) {
    const invitations = await Invitations.getInvitations();
    commit('setInvitations', invitations);
  },
  async acceptInvitation({ commit}, id: string) {
    console.log('In acceptInvitation, id: ', id);
    const invitation = await Invitations.acceptInvitation(id);
    commit('updateInvitation', invitation);
  },
  async rejectInvitation({ commit}, id: string) {
    console.log('In rejectInvitation, id: ', id);
    const invitation = await Invitations.rejectInvitation(id);
    commit('updateInvitation', invitation);
  },
  async getTransaction({ commit }, id: string) {
    const transaction = await Transactions.getTransaction(id);
    commit('updateTransaction', transaction);
  },
  async donate({ commit, state }, { amount }: { amount: number }) {
    if (state.user) {
      const trx = await Donations.initiateDonation({ amount });
      commit('addTransaction', trx);
      commit('setPaymentRequest', trx);
    }   
  },
  async nominate({ commit, state}, { nominee, name, email, role }: { nominee: string; name: string; email: string; role: NominationRole }) {
    if (state.user) {
      const invitation = await Users.nominate({ phone: nominee, name, email, role, nominatorId: state.user._id, nominatorName: state.user.name });
      console.log('invitation: ', invitation);
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
      'unsetLastPaymentRequest',
      'unsetMessage',
    ].forEach((mutation) => commit(mutation));
  }
});

export default actions;