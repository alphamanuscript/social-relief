import { wrapActions } from './util';
import { AccountService, Auth } from '../services';
import router from '../router';

const actions = wrapActions({
  async getBeneficiaries({ commit}, _id: string) {
    const beneficiaries = await AccountService.getBeneficiaries(_id);
    commit('setBeneficiaries', beneficiaries);
  },
  async getMiddlemen({ commit}, _id: string) {
    const middlemen = await AccountService.getMiddlemen(_id);
    commit('setMiddlemen', middlemen);
  },
  async getTransactions({ commit}, _id: string) {
    const transactions = await AccountService.getTransactions(_id);
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
      const trx = await AccountService.donate(state.user._id, amount);
      const updatedUser = await AccountService.updateUser({
        ...state.user,
        accountBalance: state.user.accountBalance + amount
      });
      commit('addTransaction', trx);
      commit('setUser', updatedUser);
    }
  },
  async nominateBeneficiary({ commit, state }, { nominator, beneficiary }: { nominator: string; beneficiary: string }) {
    if (state.user) {
      const result = await AccountService.getBeneficiary(beneficiary, state.user._id);
      let bnf;
      if (result) {
        bnf = await AccountService.updateBeneficiary({ 
          _id: nominator,
          associatedDonorId: state.user._id,
          timestamp: new Date()
        }, result);
        commit('updateBeneficiary', bnf);
      }
      else {
        bnf = await AccountService.nominateBeneficiary({
          _id: nominator,
          associatedDonorId: state.user._id,
          timestamp: new Date()
        }, beneficiary);
        commit('addBeneficiary', bnf);
      }
      
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
    console.log('In createUser: ', phone, password, 'donor');
    const user = await AccountService.createUser(phone, password, 'donor');
    console.log('user: ', user);
    commit('setUser', user);
    if (user) {
      router.push({ name: 'home' });
    }
  },
  async signUserIn({ commit }, { phone, password }: { phone: string; password: string }) {
    console.log('In signUserIn: ', phone, password);
    const user = await AccountService.login(phone, password);
    commit('setUser', user);
    if (user) {
      const token = JSON.stringify({ phone, password });
      Auth.setAccessToken(token);
      if (router.currentRoute.name !== 'home') router.push({ name: 'home' });
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