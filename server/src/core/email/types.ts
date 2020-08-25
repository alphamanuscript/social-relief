export interface EmailProvider {
  sendEmail(to: string, message: string): Promise<void>;
}