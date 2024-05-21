import { OrderCancelledEvent, OrderStatus } from "@vusirikala/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
    //Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0, 
        price: 10,
        userId: 'asdf',
        status: OrderStatus.Created
    });
    await order.save();

    //Create a fake data event 
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'asdfg',
        }
    }

    // Message object has a lot more properties than ack(). 
    // Using ts-ignore to let typescript know we are not committing any error by mocking on ack() method. 
    // @ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }

    return {listener, data, msg};
}

it('updates the ticket, and acks the message', async() => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(data.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    expect(msg.ack).toHaveBeenCalled();
})
