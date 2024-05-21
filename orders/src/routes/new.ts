import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@vusirikala/common';
import {body} from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();
//15 minutes. 
const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth, [
    body('ticketId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))  //Checking that ticketId is a valid mongoid. It's not recommended to do this check, because tickets microservice could be using some other database. 
        .withMessage('TicketId must be provided')
], validateRequest, async (request: Request, response: Response) => {
    const {ticketId} = request.body;

    //Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError();
    }

    //Make sure that the ticket is not already reserved
    //Run query to look at all orders. Find an order where the ticket is the ticket we just found 
    //*and* the order status is not cancelled. 
    //If we find an order from that menas the ticket is reserved. 

    /*  This is one way to do it. 
    const existingOrder = await Order.findOne({
        ticket: ticket, 
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })
    if (existingOrder) {
        throw new BadRequestError("Ticket is already reserved");
    }
    */

    const isReserved = await ticket.isReserved();
    if (isReserved) {
        throw new BadRequestError("Ticket is already reserved");
    }

    //Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    //Build the order and save it to the database
    const order = Order.build({
        userId: request.currentUser!.id,
        status: OrderStatus.Created,
        expiresAt: expiration,
        ticket: ticket
    })
    await order.save();

    //Publish an event that an order has been created
    new OrderCreatedPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        status: order.status,
        userId: order.userId,
        expiresAt: order.expiresAt.toISOString(),    //We are manually converting date into string here. If we don't do manual conversion, the date will automatically be converted into string based on your time zone. We want to convert into UTC timezone. 
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    })

    response.status(201).send(order);
})

export {router as createOrderRouter};
