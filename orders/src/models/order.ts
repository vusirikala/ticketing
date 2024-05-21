import { OrderStatus } from "@vusirikala/common";
import mongoose, { mongo } from "mongoose";
import {TicketDoc} from './ticket';
import {updateIfCurrentPlugin} from 'mongoose-update-if-current';

interface OrderAttrs {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expiresAt: Date;
    ticket: TicketDoc;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    }, 
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    }, 
    expiresAt: {
        type: mongoose.Schema.Types.Date,
    }, 
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
})

//Instead of using __v to store version, we will use "version" to store version. 
orderSchema.set('versionKey', 'version');

//This plugin implements optimistic concurrency control. 
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('order', orderSchema);

export { Order }; 