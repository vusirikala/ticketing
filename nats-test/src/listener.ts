import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import TicketCreatedListener from './events/ticket-created-listener';

// const sc = StringCodec();
console.clear();
try {

    const clientId = randomBytes(4).toString('hex');
    const client = nats.connect('ticketing', clientId, {
        url: 'http://localhost:4222'
    })

    new TicketCreatedListener(client).listen();

    client.on('close', () => {
        console.log('NATS connection closed!')
        process.exit();
    })
    process.on('SIGINT', () => client.close())
    process.on('SIGTERM', () => client.close())


    // client.on('connect', () => {
    //     console.log('Listener connected to NATS');
    //     const opts = client.subscriptionOptions()
    //                             .setManualAckMode(true);
    //     const subscription = client.subscribe('ticket:created', 'orders-service-queue-group', opts);
    //     subscription.on('message', (msg) => {
    //         console.log('Received a message [' + msg.getSequence() + '] ' + msg.getData())
    //     }) 
    // })

    // for await (const m of subscription) {
    //     console.log(sc.decode(m.data));
    //   }

} catch (err) {
    console.error(err);
}

