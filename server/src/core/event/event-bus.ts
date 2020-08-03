import { EventEmitter } from 'events';
import { UserInvitationEventData } from '../user';
import { TransactionCreatedEventData } from '../payment';
import * as EventName from './event-name';

export interface Event<T> {
  time: Date,
  data: T;
}

export interface Listener<T> {
  (event: Event<T>): any;
}

export function createEvent<T>(data: T) {
  return {
      time: new Date(),
      data
  }; 
}

export class EventBus extends EventEmitter {
  constructor() {
    super();
  }

  emitUserInvitationCreated(eventData: UserInvitationEventData): void {
    this.emit(EventName.USER_INVITATION_CREATED, createEvent(eventData))
  }

  onUserInvitationCreated(listener: Listener<UserInvitationEventData>): void {
    this.on(EventName.USER_INVITATION_CREATED, listener);
  }

  emitTransactionCompleted(eventData: TransactionCreatedEventData): void {
    this.emit(EventName.TRANSACTION_COMPLETED, createEvent(eventData));
  }

  onTransactionCompleted(listener: Listener<TransactionCreatedEventData>): void {
    this.on(EventName.TRANSACTION_COMPLETED, listener);
  }
}
