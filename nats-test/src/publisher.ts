import nats, {Stan} from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import {TicketCreatedPublisher} from './events/ticket-created-publisher';

console.clear();
try {
    const clientId = randomBytes(4).toString('hex');
    const client = nats.connect('ticketing', clientId, {
        url: 'http://localhost:4222',
    }); 
    
    client.on('connect', async () => {
        console.log('Publisher connected to NATS');
        const publisher = new TicketCreatedPublisher(client);
        const data = {
            id: '123',
            title: 'concert',
            price: 20
        };
        try {
            await publisher.publish(data);
        } catch(err) {
            console.error(err);
        }

        // client.publish('ticket:created', data, () => {
        //     console.log('Event published');
        // })
    })
} catch (err) {
    console.error(err);
}
