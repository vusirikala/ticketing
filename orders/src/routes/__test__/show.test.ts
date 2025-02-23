import request from "supertest";
import {app} from '../../app';
import mongoose from 'mongoose';
import {Order} from '../../models/order';
import {Ticket} from '../../models/ticket';
import { OrderStatus } from "@vusirikala/common";


it ('fetches the order', async () => {
    //Create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    //Make a request to build an order with this ticket
    const user = global.signin();
    const {body: order} = await request(app)
                            .post('/api/orders')
                            .set('Cookie', user)
                            .send({ticketId: ticket.id})
                            .expect(201);

    //Make a request to fetch the order
    const response = await request(app)
                        .get(`/api/orders/${order.id}`)
                        .set('Cookie', user)
                        .send()
                        .expect(200);
    expect(response.body.order.id).toEqual(order.id);

})


it ('Returns 401 if one users tries to fetch another user order', async () => {
    //Create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        id: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save();

    //Make a request to build an order with this ticket
    const user = global.signin();
    const {body: order} = await request(app)
                            .post('/api/orders')
                            .set('Cookie', user)
                            .send({ticketId: ticket.id})
                            .expect(201);

    //Make a request to fetch the order
    const response = await request(app)
                        .get(`/api/orders/${order.id}`)
                        .set('Cookie', global.signin())
                        .send()
                        .expect(401);
})