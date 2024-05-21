import request from 'supertest';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@vusirikala/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    //Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    //Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    //Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'anotherconcert',
        price: 120,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    //Create a fake msg object
    // @ts-ignore
    const msg : Message = {
        ack: jest.fn()
    }
    //return all of this stuff
    return {listener, data, msg, ticket};
}

it('finds, updates, and saves a ticket', async () => {
    const {listener, data, msg, ticket} = await setup();
    
     //Call the onMessage function with the data object + message object
     await listener.onMessage(data, msg); 

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.version).toEqual(data.version);
    expect(updatedTicket!.price).toEqual(data.price);
})


it('acks the message', async () => {
    const {listener, data, msg} = await setup();
    
    //Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg); 

    //Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if the event has skipped version', async () => {
    const {msg, data, listener} = await setup();
    data.version = 10;
    
    //Call the onMessage function with the data object + message object
    try {
        await listener.onMessage(data, msg); 
    } catch (err) {
    }
    expect(msg.ack).not.toHaveBeenCalled();
})