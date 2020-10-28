import Vue from 'vue';
import Vuex from 'vuex';
import getters from './getters';
import mutations from './mutations';
import actions from './actions';
import { faqs, testimonials } from '../data';
import { AppState } from '../types';

Vue.use(Vuex)

const state: AppState = {
  user: undefined,
  anonymousUser: undefined,
  newUser: undefined,
  anonymousDonationDetails: undefined,
  beneficiaries: [],
  middlemen: [],
  transactions: [],
  invitations: [],
  currentInvitation: undefined,
  message: { type: '', message: '' },
  lastPaymentRequest: undefined,
  stats: undefined,
  testimonials,
  faqs
}

const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions
});

export default store;
