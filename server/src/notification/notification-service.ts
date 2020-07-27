import { EventEmitter } from 'events';
import { EventMessage, ClientEvents } from '../client-events';
import { EventMessageType, EventName } from '../event-bus';

export class Notifications {
    readonly eventBus: EventEmitter;
    readonly smsService: ClientEvents;

    constructor (eventBus: EventEmitter, smsService: ClientEvents) {
        this.eventBus = eventBus;
        this.smsService = smsService;
        this.registerHandler();
    }

    registerHandler() {
        this.eventBus.on(EventName.FILE_IMPORT_COMPLETE, (data: any) => this.onFileImportComplete(data));
    }

    async handleCompletedTransaction(event: TransactionCompletedEvent) {
        await this.smsService.sendSms(event.data.phone, `Transaction of amount { event.data.amount } completed.`);
    }
}