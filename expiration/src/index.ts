import { ServerError } from '@vusirikala/common';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import {natsWrapper} from './nats-wrapper';

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

    } catch (err) {
        console.error(err);
    }
}
start()
