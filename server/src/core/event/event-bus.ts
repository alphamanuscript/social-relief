import { EventEmitter } from 'events';

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
}