import { Publisher, Subjects, TicketUpdatedEvent } from "@vusirikala/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
