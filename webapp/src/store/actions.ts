import { wrapActions } from './util';
import { AccountService, Users, Transactions, Donations } from '../services';
import router from '../router';

const actions = wrapActions({
  async getBeneficiaries({ commit }, _id: string) {
    const beneficiaries = await AccountService.getBeneficiaries(_id);
    commit('setBeneficiaries', beneficiaries);
  },
  async getMiddlemen({ commit}, _id: string) {
    const middlemen = await AccountService.getMiddlemen(_id);
    commit('setMiddlemen', middlemen);
  },
  async getTransactions({ commit}) {
    const transactions = await Transactions.getTransactions();
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
  },
  async getInvitation({ commit }, { path }: { path: string }) {
    console.log('path in getInvitation: ', path);
    const invitation = await AccountService.getInvitation(path);
    commit('setInvitation', invitation);
  },
  async acceptInvitation({ commit }, { _id }: { _id: string }) {
    console.log('_id in deleteInvitation: ', _id);
    await AccountService.acceptInvitation(_id);
    commit('setInvitation', null);
  },
  async doesUserExist({ commit }, { phone }: { phone: string }) {
    console.log('phone in doesUserExist: ', phone);
    const user = await AccountService.getUser(phone);
    if (user) {
      commit('setSigninPhone', phone);
      router.push({ name: 'sign-in', params: { phone } });
    }
    else {
      commit('setSignupPhone', phone);
    }
  },
  async createUser({ commit }, { phone, password }: { phone: string; password: string }) {
    const user = await Users.createUser({ phone, password });
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
  async getCurrentUser({ commit }) {
    const user = await Users.getCurrentUser();
    if (user) {
      commit('setUser', user);
    }
  },
  async clearData({ commit }) {
    [
      'unsetUser',
      'unsetProject',
      'unsetProjects',
      'unsetUserDataLoaded',
      'unsetMessage',
      'unsetProjectEntities',
      'unsetProjectFile',
      'unsetProjectFileImport',
      'unsetProjectTables',
      'unsetDatabaseEmpty',
      'unsetQueryFilters',
      'unsetCurrentQuery',
      'unsetChartXAxis',
      'unsetChartYAxis',
      'unsetAggregatedEntities',
      'unsetDataSourceProviders',
      'unsetDataSourceConnections',
      'unsetDataSourceConnection'
    ].forEach((mutation) => commit(mutation));
  }
});

export default actions;