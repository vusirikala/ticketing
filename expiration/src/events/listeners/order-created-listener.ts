import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@vusirikala/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        await expirationQueue.add({
            orderId: data.id,
        }, {
            //If delay input is not given, the job will be processed immediately. 
            delay: delay    //The job will be processed after a delay of these many milliseconds. 
        })
        msg.ack(); 
    }
}