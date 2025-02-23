import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@vusirikala/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findById({
            _id: data.id,
            version: data.version - 1 
        });

        if (!order) {
            throw new Error("Order not found");
        }

        order.set({status : OrderStatus.Cancelled});
        await order.save();

        msg.ack();
    }
}