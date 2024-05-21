import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@vusirikala/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { natsWrapper } from '../nats-wrapper';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
const router = express.Router();


router.delete('/api/orders/:orderId', requireAuth, async (request: Request, response: Response) => {
    const order = await Order.findById(request.params.orderId);
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== request.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    //Publish an event saying the thing is cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    })

    response.status(204).send(order);
})

export {router as deleteOrderRouter};
