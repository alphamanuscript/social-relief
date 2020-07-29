import { EventEmitter } from 'events';
import { UserInvitationEventData } from '../user';
import { USER_INVITATION_CREATED } from './event-name';

export interface Event<T> {
  time: Date,
  data: T;
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
    this.emit(USER_INVITATION_CREATED, createEvent(eventData))
  }
}