import { Ticket } from './ticket.entity';
import { TICKET_REPOSITORY } from '../../core/constants';

export const ticketsProviders = [
    {
        provide: TICKET_REPOSITORY,
        useValue: Ticket,
    },
];
