import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

export function hashPassword(plaintext: string): Promise<string> {
  return argon2.hash(plaintext);
}

export function generateId(): string {
  return randomBytes(16).toString('hex');
}