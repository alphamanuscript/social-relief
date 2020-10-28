import { PaymentProviderRegistry, PaymentProvider } from './types';
import { createAppError } from '../error';

export class PaymentProviders implements PaymentProviderRegistry {
  private providers: {
    [name: string]: PaymentProvider
  } = {};

  private preferredSending: string;
  private preferredRefunds: string;
  private preferredReceiving: string;

  register(provider: PaymentProvider): void {
    this.providers[provider.name()] = provider;
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers[name];
    if (!provider) throw createAppError(`Unknown provider ${name}`, 'serverError');

    return provider;
  }

  getPreferredForReceiving(): PaymentProvider {
    return this.getProvider(this.preferredReceiving);
  }

  setPreferredForReceiving(name: string): void {
    this.preferredReceiving = name;
  }

  getPreferredForSending(): PaymentProvider {
    return this.getProvider(this.preferredSending);
  }

  setPreferredForSending(name: string): void {
    this.preferredSending = name;
  }

  getPreferredForRefunds(): PaymentProvider {
    return this.getProvider(this.preferredRefunds);
  }

  setPreferredForRefunds(name: string): void {
    this.preferredRefunds = name;
  }

}