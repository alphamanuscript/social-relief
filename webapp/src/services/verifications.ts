import { PhoneVerificationRecord, PhoneVerificationArgs } from '../types';
import axios from 'axios';

export const Verifications = {
  async createPhoneVerificationRecord(phone: string) {
    const res = await axios.post<PhoneVerificationRecord>(`/verifications/phone`, {phone});
    return res.data;
  },
  async verifyPhone(args: PhoneVerificationArgs) {
    const { id, code } = args;
    const res = await axios.put<PhoneVerificationRecord>(`/verifications/phone/${id}`, {code});
    return res.data;
  },
  async getPhoneVerificationRecord(recordId: string) {
    const res = await axios.get<PhoneVerificationRecord>(`/verifications/phone/${recordId}`);
    return res.data;
  },
  async resendPhoneVerificationCode(recordId: string) {
    const res = await axios.put<PhoneVerificationRecord>(`/verifications/phone/resend/code/${recordId}`);
    return res.data;
  }
}