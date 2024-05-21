import { OrderStatus } from '@vusirikala/common';
import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';

//We are importing the real nats-wrapper but jest will instead import mock nats-wrapper;
import {natsWrapper} from '../../nats-wrapper';
import { stripe } from '../../stripe';

it('returns a 404 when paying for an order that does not exist', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf', 
            orderId: new mongoose.Types.ObjectId().toHexString()
            })
        .expect(404)
})

it('returns a 401 when the order does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 1
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdf', 
            orderId: order.id
            })
        .expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Cancelled,
        userId,
        version: 1
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdf', 
            orderId: order.id
            })
        .expect(400)
})

// Use this test when you want to mock Stripe API by defining stripe.ts in __mock__
// it('returns a 201 with valid inputs', async () => {
//     const userId = new mongoose.Types.ObjectId().toHexString();
//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         price: 20,
//         status: OrderStatus.Created,
//         userId,
//         version: 1
//     })
//     await order.save();

//     await request(app)
//         .post('/api/payments')
//         .set('Cookie', global.signin(userId))
//         .send({
//             token: 'tok_visa', 
//             orderId: order.id
//             })
//         .expect(201);
    
//     const charge = (stripe.charges.create as jest.Mock).mock.calls[0][0];
//     expect(charge.currency).toEqual('usd');
//     expect(charge.amount).toEqual(2000);
//     expect(charge.source).toEqual('tok_visa');
// })


//This test utilizes real Stripe API
//After creating a charge, we want to test that the charge was properly created. 
//We can let the route handler return the charge details and test them here. But we shouldn't change how a route handler works for the sake of writing a test. 
//So, instead we use the Stripe API to retrieve the last 10 charges made, and test if our charge is in it. For this, we will create a charge with random price. 
it('returns a 201 with valid inputs', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created,
        userId,
        version: 1
    })
    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa', 
            orderId: order.id
            })
        .expect(201);
    
    const stripeCharges = await stripe.charges.list({
        limit: 50
    });
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    })
    expect(stripeCharge).toBeDefined(); 
    expect(stripeCharge!.currency).toEqual('usd'); 

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    })
    expect(payment).not.toBeNull();

})