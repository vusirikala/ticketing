import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';

//This is the information contained inside a job. A job just contains orderid. 
interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST,
    }
});

//This is the code to process a job. 
//This job contains our payload along with other metadata. 
expirationQueue.process( async (job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})

export {expirationQueue};