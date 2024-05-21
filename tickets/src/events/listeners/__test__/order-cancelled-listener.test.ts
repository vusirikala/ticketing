import { OrderCancelledEvent, OrderStatus } from "@vusirikala/common";
import { json } from "express";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { listenerCount } from "process";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"

const setup = async () => {
    //Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);
    
    //Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'asdf',
    })
    ticket.set({orderId: OrderStatus.Created});
    await ticket.save();

    //Create a fake data event 
    const data: OrderCancelledEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
        }
    }

    // Message object has a lot more properties than ack(). 
    // Using ts-ignore to let typescript know we are not committing any error by mocking on ack() method. 
    // @ts-ignore
    const msg : Message = {
        ack : jest.fn()
    }

    return {listener, ticket, data, msg};
}

it('updates the ticket, publishes and event, and acks the message', async() => {
    const {listener, ticket, data, msg} = await setup();

    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(data.ticket.id);
    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
