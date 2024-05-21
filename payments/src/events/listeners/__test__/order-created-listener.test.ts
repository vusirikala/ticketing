import { OrderCreatedEvent, OrderStatus } from "@vusirikala/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
    //Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
    
    //Create a fake data event 
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'asdf',
        expiresAt: 'asdf',
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 20
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

it('an order has been created', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    
    const newOrder = await Order.findById(data.id);
    expect(newOrder!.id).toEqual(data.id);
    expect(newOrder!.price).toEqual(data.ticket.price);
    expect(newOrder!.version).toEqual(data.version);
    expect(newOrder!.status).toEqual(data.status);    
    expect(newOrder!.userId).toEqual(data.userId);    
})

it('acks the message', async() => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

