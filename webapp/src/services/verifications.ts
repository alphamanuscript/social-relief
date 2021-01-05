import { PhoneVerificationRecord } from '../types';
import axios from 'axios';

export const Verifications = {
  async verifyPhone(recordId: string) {
    const res = await axios.put<PhoneVerificationRecord>(`/verifications/phone/${recordId}`);
    return res.data;
  },
}