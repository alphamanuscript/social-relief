import { EventEmitter } from 'events';

export interface Sms<T> {
  type: string;
  time: Date,
  data: T;
}

export interface SmsServiceInterface {
  createSms<T> (data: T): T;
  // broadcast(msg: EventMessage): void;
}