import {Publisher, OrderCancelledEvent, Subjects} from '@vusirikala/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}