import { wrapActions, googleSignOut } from './util';
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
  async nominate({ commit, state}, { nominee, email, role }: { nominee: string; email: string; role: string }) {
    console.log('Inside nominate...')
    console.log('Inside nominate: ', nominee, email, role)
    console.log('role === Beneficiary: ', role === 'Beneficiary')
    console.log('state.user ', state.user)
    if (state.user && role === 'Beneficiary') {
      console.log('Nominee is a beneficiary')
      const bnf = await Users.nominateBeneficiary({ phone: nominee, email, nominator: state.user._id });
      commit('addBeneficiary', bnf);
    }
    else if (state.user && role === 'Middleman') {
      console.log('Nominee is a middleman')
      const mdn = await Users.nominateMiddleman({ phone: nominee, email, nominator: state.user._id });
      commit('addMiddleman', mdn);
    }
  },
  /**
   * Valid combinations for creating a user: 
   * createUser({phone, password}) OR
   * createUser({phone, googleIdToken})
   */
  async createUser({ commit }, { phone, password, googleIdToken }: { phone: string; password: string; googleIdToken: string }) {
    const user = await Users.createUser({ phone, password, googleIdToken });
    await Users.login({ phone, password, googleIdToken });
    commit('setUser', user);
    if (user) {
      router.push({ name: 'beneficiaries' });
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
      if (router.currentRoute.name !== 'beneficiaries') router.push({ name: 'beneficiaries' });
    }
  },
  async signUserOut({ dispatch }) {
    await Users.logout();
    await googleSignOut();
    dispatch('clearData');
    router.push({ name: 'home' });
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