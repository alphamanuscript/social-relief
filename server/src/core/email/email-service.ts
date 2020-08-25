import { EmailProvider } from './types';

export class EmailService implements EmailProvider{
  async sendEmail(to: string, message: string): Promise<void> { 
    // TODO
  }
}
  