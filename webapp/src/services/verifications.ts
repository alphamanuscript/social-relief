import { PhoneVerificationRecord, PhoneVerificationArgs } from '../types';
import axios from 'axios';

export const Verifications = {
  async verifyPhone(args: PhoneVerificationArgs) {
    const { id, code } = args;
    const res = await axios.put<PhoneVerificationRecord>(`/verifications/phone/${id}`, {code});
    return res.data;
  },
  async getPhoneVerificationRecord(recordId: string) {
    const res = await axios.get<PhoneVerificationRecord>(`/verifications/${recordId}`);
    return res.data;
  },
}