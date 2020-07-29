import { EventEmitter } from 'events';
import { UserInvititationEventData } from '../user';

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

  on()

  private subcribeInboundEvents () {
    // this.on(EventName.FILE_IMPORT_COMPLETE, (data: any) => this.onFileImportComplete(data));
  }

  emitUserInvitationCreated(eventData: UserInvititationEventData) {

  }
}