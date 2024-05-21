import {Listener, OrderCreatedEvent, Subjects} from '@vusirikala/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            version: data.version,
            userId: data.userId,
            status: data.status
        })
        
        await order.save();

        //Ack the message
        msg.ack();
    }
}