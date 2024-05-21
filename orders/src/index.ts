import mongoose from 'mongoose';
import { ServerError } from '@vusirikala/common';
import {app} from './app';
import {natsWrapper} from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

async function start () {
    try {
        if (!process.env.JWT_KEY) {
            throw new ServerError('JWT KEY is not defined ');
        }
        
        if (!process.env.MONGO_URI) {
            throw new ServerError('MONGO URI is not defined');
        }

        if (!process.env.NATS_CLUSTER_ID) {
            throw new ServerError('NATS CLUSTER ID is not defined');
        }

        if (!process.env.NATS_CLIENT_ID) {
            throw new ServerError('NATS CLIENT ID is not defined');
        }

        if (!process.env.NATS_URL) {
            throw new ServerError('NATS URL is not defined');
        }
        
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID, 
            process.env.NATS_CLIENT_ID, 
            process.env.NATS_URL
        );

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!')
            process.exit();
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();
        
        await mongoose.connect(process.env.MONGO_URI)  
        console.log("Connected to mongodb")
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000!")
    })    
}
start()
