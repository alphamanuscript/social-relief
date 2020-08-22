
export interface SmsProvider {
  sendSms(to: string, message: string): Promise<void>;
}