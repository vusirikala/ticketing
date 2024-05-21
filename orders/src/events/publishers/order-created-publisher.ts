import {Publisher, OrderCreatedEvent, Subjects} from '@vusirikala/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}