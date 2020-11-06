export interface EmailProvider {
  sendEmail(to: string, message: string, subject?: string): Promise<void>;
}