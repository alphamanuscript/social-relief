import axios from 'axios';
import {
  LoginResult, 
  User,
  UserCreateArgs,
  UserLoginArgs,
  UserNominateArgs,
  Invitation,
  UserPutArgs
} from '../types';
import { Auth, Anonymous } from '@/services';

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
  async getUser(userId: string) {
    const res = await axios.get<User>(`/users/${userId}`);
    return res.data;
  },
  async getAnonymousUser(userId: string) {
    const res = await axios.get<User>(`/users/anonymous${userId}`);
    Anonymous.setUserData(JSON.stringify(res.data));
    return res.data;
  },
  async createNewUserOrAssumeNewRole (invitationId: string) {
    const res = await axios.post<User>('/users/activate-invitee', { invitationId });
    return res.data;
  },
  async updateUser (userId: string, args: UserPutArgs) {
    const res = await axios.put<User>(`/users/${userId}`, args);
    return res.data;
  },
  async logout () {
    const res = await axios.post('/users/logout');
    Auth.deleteAccessToken();
    return res.data;
  }
}