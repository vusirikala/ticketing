import { Publisher, Subjects, TicketCreatedEvent } from "@vusirikala/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
