import { Module } from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { reservationsProviders } from './reservations.providers';
import { DatabaseModule } from '../../core/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ReservationsService, ...reservationsProviders],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
