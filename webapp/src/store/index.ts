import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import { AppState } from '../types';

Vue.use(Vuex)

const state: AppState = {
  user: undefined,
  beneficiaries: [],
  transactions: [],
  message: { type: '', message: '' },
}

const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions
});

export default store;
