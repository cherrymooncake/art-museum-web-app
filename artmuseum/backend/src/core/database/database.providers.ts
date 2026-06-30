import { DEVELOPMENT, PRODUCTION, SEQUELIZE, TEST } from '../constants';
import { databaseConfig } from './database.config';
import { Sequelize } from 'sequelize-typescript';
import { User } from '../../modules/users/user.entity';
import { Ticket } from '../../modules/tickets/ticket.entity';
import { Exhibition } from '../../modules/exhibitions/exhibition.entity';
import { Artwork } from '../../modules/artworks/artwork.entity';
import { Reservation } from '../../modules/reservations/reservation.entity';

export const databaseProviders = [
    {
        provide: SEQUELIZE,
        useFactory: async () => {
            let config;
            switch (process.env.NODE_ENV) {
                case DEVELOPMENT:
                    config = databaseConfig.development;
                    break;
                case TEST:
                    config = databaseConfig.test;
                    break;
                case PRODUCTION:
                    config = databaseConfig.production;
                    break;
                default:
                    config = databaseConfig.development;
            }

            try {
                // tslint:disable-next-line:no-console
                console.log('Connecting to DB:', config.database);

                const sequelize = new Sequelize(config);
                sequelize.addModels([User, Ticket, Exhibition, Artwork, Reservation]);

                await sequelize.authenticate();
                // tslint:disable-next-line:no-console
                console.log('DB connection successful');
                await sequelize.sync();
                return sequelize;
            } catch (error) {
                // tslint:disable-next-line:no-console
                console.error('Failed to connect to database:', error);
                throw error;
            }
        },
    },
];
