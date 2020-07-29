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
    this.subcribeInboundEvents();
  }

  private subcribeInboundEvents () {
    // this.on(EventName.FILE_IMPORT_COMPLETE, (data: any) => this.onFileImportComplete(data));
  }

  emitUserInvitationCreated(eventData: UserInvitationEventData): void {
    this.emit(USER_INVITATION_CREATED, createEvent(eventData))
  }

  // onUserInvitationCreated(eventData: Event<UserInvitationEventData>): void {
  //   this.on(EVENT_USER_INVITATION_CREATED, )
  // }
}