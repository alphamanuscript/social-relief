import axios from 'axios';
import {
  LoginResult, 
  User,
  UserCreateArgs,
  UserLoginArgs,
  UserNominateBeneficiaryArgs
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
  async nominateBeneficiary(args: UserNominateBeneficiaryArgs) {
    const res = await axios.post<User>('/users/beneficiaries', args);
    return res.data;
  },
  async getBeneficiaries() {
    const res = await axios.get<User>('/users/beneficiaries');
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