import { Reservation } from './reservation.entity';
import { RESERVATION_REPOSITORY } from '../../core/constants';

export const reservationsProviders = [
    {
        provide: RESERVATION_REPOSITORY,
        useValue: Reservation,
    },
];
