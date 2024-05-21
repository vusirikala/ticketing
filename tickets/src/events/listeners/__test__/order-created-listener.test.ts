import { OrderCreatedEvent, OrderStatus } from "@vusirikala/common";
import { json } from "express";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCreatedListener } from "../order-created-listener"

const setup = async () => {
    //Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);
    
    //Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 99,
        userId: 'asdf'
    })
    await ticket.save();

    //Create a fake data event 
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'asdf',
        expiresAt: 'asdf',
        ticket: {
            id: ticket.id,
            price: ticket.price
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

it('publishes a ticket udpated event', async () => {
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    console.log(ticket);
    console.log(data);
    //This lists down all the calls made to the publish function. Typescript interprets as the original publish method. We use ts-ignore to let typescript know that it doesn't have to worry and publish is a mock function. 
    // @ts-ignore
    console.log(natsWrapper.client.publish.mock.calls);
    
    //This is another way of letting typescript know that publish function is a mock. 
    console.log( (natsWrapper.client.publish as jest.Mock).mock.calls);

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
})

it('sets the UserId of the ticket', async() => {
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket);
    expect(updatedTicket!.orderId).toEqual(data.id);
})

it('acks the message', async() => {
    const {listener, ticket, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})

