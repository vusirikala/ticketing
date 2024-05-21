import mongoose from 'mongoose';
import { ServerError } from '@vusirikala/common';
import {app} from './app';
import {natsWrapper} from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

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

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

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
