import axios from 'axios';
import {
  LoginResult, 
  User,
  UserCreateArgs,
  UserLoginArgs,
  UserNominateArgs,
  Invitation
} from '../types';
import { Auth } from './auth';

export const Users = {
  async createUser (args: UserCreateArgs) {
    const res = await axios.post<User>('/users', args);
    return res.data;
  },
  async login(args: UserLoginArgs) {
    const res = await axios.post<LoginResult>(`/users/login`, args);
    Auth.setAccessToken(res.data.token._id);
    return res.data.user;
  },
  async nominate(args: UserNominateArgs) {
    const res = await axios.post<Invitation>('/users/nominate', args);
    return res.data;
  },
  async getBeneficiaries() {
    const res = await axios.get<User>('/users/beneficiaries');
    return res.data;
  },
  async getMiddlemen() {
    const res = await axios.get<User>('/users/middlemen');
    return res.data;
  },
  async getCurrentUser () {
    const res = await axios.get<User>('/users/me');
    return res.data;
  },
  async logout () {
    const res = await axios.post('/users/logout');
    Auth.deleteAccessToken();
    return res.data;
  }
}