import { ExpirationCompleteEvent, OrderStatus } from "@vusirikala/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'ansd',
        expiresAt: new Date(),
        ticket,
    })
    await order.save();

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticket, order, data, msg}
}

it('updates the order status to cancelled', async () => {
    const {listener, ticket, order, data, msg} = await setup();
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('emits an order cancelled event', async () => {
    const {listener, ticket, order, data, msg} = await setup();
    await listener.onMessage(data, msg);
    console.log(order);
    console.log(ticket);
    console.log(await Order.find({}))
    console.log( (natsWrapper.client.publish as jest.Mock).mock.calls );  
    const eventData = JSON.parse( 
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(eventData.id).toEqual(order.id);
})

it('acks the message', async () => {
    const {listener, ticket, order, data, msg} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toHaveBeenCalled();
})