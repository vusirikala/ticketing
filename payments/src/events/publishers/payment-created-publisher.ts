import { Publisher, Subjects, PaymentCreatedEvent } from "@vusirikala/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
