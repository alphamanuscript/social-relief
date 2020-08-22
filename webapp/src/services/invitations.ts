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
  },
  async acceptInvitation(invitationId: string) {
    const args = { accept: true };
    const res = await axios.put<Invitation>(`/invitations/${invitationId}`, args);
    return res.data;
  },
  async rejectInvitation(invitationId: string) {
    const args = { accept: false };
    const res = await axios.put<Invitation>(`/invitations/${invitationId}`, args);
    return res.data;
  }
}