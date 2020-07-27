// import { Sms, SmsServiceInterface } from './types';
// import { EventMessageType } from '../event-bus';

// export class SmsService implements SmsServiceInterface {
//     readonly wss: any;

//     constructor (wss: any) {
//         this.wss = wss;
//         this.pingConnectedClients();
//     }
    

//     /**
//      * sends a ping sms to every connected client
//      * every 30 seconds
//      */
//     pingConnectedClients () {
//         const interval = setInterval(() => {
//             const sms: Sms<T> = { type: EventMessageType.PING, time: new Date(), data: {} };
//             this.broadcast(sms);
//         }, 30000);
//     }

//     // createSms<T> (data: T): Sms<T> {
//     //   return {
//     //     time: new Date(),
//     //     data
//     //   };
//     // }

//     /**
//      * sends sms to specified client
//      * @param {any} ws websocket connection to client
//      * @param {Sms} msg
//      */
//     send<T> (ws: any, msg: Sms<T>): void {
//         ws.send(JSON.stringify(msg));
//     }

//     /**
//      * sends sms to all clients
//      * @param {Sms} msg
//      */
//     broadcast<T> (msg: Sms<T>) {
//         this.wss.clients.forEach((ws: any) => this.send(ws, msg));
//     }
// }