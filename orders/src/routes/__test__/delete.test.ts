import request from "supertest";
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {Ticket} from '../../models/ticket';
import { OrderStatus } from "@vusirikala/common";
import {natsWrapper} from '../../nats-wrapper';

it('marks an order as cancelled', async () => {
    //Create a ticket with Ticket model
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    //make a request to create an order
    const user = global.signin();
    const {body: order} = await request(app)
                            .post('/api/orders')
                            .set('Cookie', user)
                            .send({ticketId: ticket.id})
                            .expect(201);

    //make a request to cancel the order
    await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .send()
            .expect(204);

    //expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})


it("emits an event after order is cancelled", async () => {
    //Create a ticket with Ticket model
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    //make a request to create an order
    const user = global.signin();
    const {body: order} = await request(app)
                            .post('/api/orders')
                            .set('Cookie', user)
                            .send({ticketId: ticket.id})
                            .expect(201);

    //make a request to cancel the order
    await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', user)
            .send()
            .expect(204);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})
