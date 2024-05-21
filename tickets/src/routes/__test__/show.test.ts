import request from 'supertest';
import { app } from '../../app';
import {Ticket} from '../../models/ticket';
import mongoose from 'mongoose';

it('returns a 404 if the ticket is not found', async() => {
    const id = new mongoose.Types.ObjectId().toHexString();
    console.log(`id = ${id}`);
    const response = await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404);    
})

it('returns the ticket if the ticket is found', async() => {
    process.env.JWT_KEY = 'asdf';
    const title = "something";
    const price = 20;
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title, price
        })
        .expect(201);
    console.log(`id = ${response.body.id}`);
    const response2 = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);
    expect(response2.body.title).toEqual(title);
    expect(response2.body.price).toEqual(price);
    
})
