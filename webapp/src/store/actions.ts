import { wrapActions } from './util';
import { Users, Transactions, Donations } from '../services';
import router from '../router';

const actions = wrapActions({
  async getBeneficiaries({ commit }) {
    const beneficiaries = await Users.getBeneficiaries();
    commit('setBeneficiaries', beneficiaries);
  },
  async getTransactions({ commit}) {
    const transactions = await Transactions.getTransactions();
    commit('setTransactions', transactions);
  },
  async donate({ commit, state }, { amount }: { amount: number }) {
    if (state.user) {
      const trx = await Donations.initiateDonation({ amount });
      commit('addTransaction', trx);
    }
  },
  async nominateBeneficiary({ commit, state }, { beneficiary }: { beneficiary: string }) {
    if (state.user) {
      const bnf = await Users.nominateBeneficiary({ phone: beneficiary, nominator: state.user._id });
      commit('addBeneficiary', bnf);
    }
  },
  async createUser({ commit }, { phone, password }: { phone: string; password: string }) {
    const user = await Users.createUser({ phone, password });
    await Users.login({ phone, password });
    commit('setUser', user);
    if (user) {
      router.push({ name: 'home' });
    }
  },
  async signUserIn({ commit }, { phone, password }: { phone: string; password: string }) {
    const user = await Users.login({ phone, password });
    if (user) {
      commit('setUser', user);
      if (router.currentRoute.name !== 'home') router.push({ name: 'home' });
    }
  },
  async signUserOut({ dispatch }) {
    await Users.logout();
    dispatch('clearData');
    router.push({ name: 'sign-in' });
  },
  async getCurrentUser({ commit }) {
    const user = await Users.getCurrentUser();
    if (user) commit('setUser', user);
  },
  async clearData({ commit }) {
    [
      'unsetUser',
      'unsetBeneficiaries',
      'unsetTransactions',
      'unsetMessage',
    ].forEach((mutation) => commit(mutation));
  }
});

export default actions;