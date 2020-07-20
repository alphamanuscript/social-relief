import { Invitation } from '../types';
import axios from 'axios';

export const Invitations = {
  async getInvitations() {
    const res = await axios.get<Invitation[]>('/invitations');
    return res.data;
  },
  async getInvitation(invitationId: string) {
    const res = await axios.get<Invitation>(`/invitations/${invitationId}`);
    return res.data;
  }
}