import { EventEmitter } from 'events';

export interface Event<T> {
  time: Date,
  data: T;
}

export class EventService extends EventEmitter {
  constructor() {
    super();
  }

  createEvent<T> (data: T): Event<T> {
    return {
        time: new Date(),
        data
     };
  }
}