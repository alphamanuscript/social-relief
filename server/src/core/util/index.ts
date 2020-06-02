import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain);
}

export async function verifyPassword(hashed: string, plain: string): Promise<boolean> {
  try {
    return argon2.verify(hashed, plain);
  }
  catch (e)
  {
    return false;
  }
}

export function generateId(): string {
  return randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return randomBytes(64).toString('hex');
}


export function hasOnlyAllowedKeys (arg: any, allowedKeys: string[]): boolean {
  return arg ? !Object.keys(arg).some(key => !allowedKeys.includes(key)) : false;
}