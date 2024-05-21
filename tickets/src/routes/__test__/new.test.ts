import request from 'supertest';
import { app } from '../../app';
import {Ticket} from '../../models/ticket';

//We are importing the real nats-wrapper but jest will instead import mock nats-wrapper;
import {natsWrapper} from '../../nats-wrapper';

it('has a route handler list listening to /api/tickets for post requests', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});
    expect(response.status).not.toEqual(404);
})

it('can only be accessed if the user signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401);
})

it('returns a status other than 40f if the user signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});
    console.log(response.status);
    expect(response.status).not.toEqual(401);
})

it('returns an error if invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title : "something",
            price : ""
        })
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title : "something",
        })
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title : "something",
            price : "-10"
        })
        .expect(400);
})

it('returns an error if invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title : "",
            price : "10"
        })
        .expect(400);
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price : "10",
        })
        .expect(400);
})

it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    const title = "something";

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price : "10"
        })
        .expect(201);

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(10);
    
})

it('publishes an event', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    const title = "something";

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price : "10"
        })
        .expect(201);
    expect(natsWrapper.client.publish).toHaveBeenCalled();

})