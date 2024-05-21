import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import {Ticket} from '../../models/ticket';
import {natsWrapper} from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'something',
            price: 20
        })
    .expect(404);
})

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title: 'something',
            price: 20
        })
    .expect(401);
})

it('returns a 401 if the user does not own a ticket', async () => {
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', global.signin())
        .send({
            title: 'something',
            price: 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signin())
        .send({
            title: 'anotherthing',
            price: 1000
        })
        .expect(401);
})

it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'something',
            price: 20
        });
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 1000
        })
        .expect(400);
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'something',
            price: -10
        })
        .expect(400);
})

it('updates the tickets provided valid inputs', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'something',
            price: 20
        });
    
    const ticketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'anotherthing',
            price: 100
        })
        .expect(200);
    
    expect(ticketResponse.body.title).toEqual('anotherthing');
    expect(ticketResponse.body.price).toEqual(100);
})

it('publishes an event', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'something',
            price: 20
        });
    
    const ticketResponse = await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'anotherthing',
            price: 100
        })
        .expect(200);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
})

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', cookie)
        .send({
            title: 'something',
            price: 20
        });
    
    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString() })
    ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'anotherthing',
            price: 100
        }).expect(404);
})