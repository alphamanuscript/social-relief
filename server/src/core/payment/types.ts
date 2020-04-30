import { Transaction } from '../transaction';
import { User } from '../user';

export interface PaymentService {
  initiatePaymentFromUser(user: User, transaction: Transaction): Promise<void>;
}

export class Payments implements PaymentService {
  initiatePaymentFromUser(user: User, transaction: Transaction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}