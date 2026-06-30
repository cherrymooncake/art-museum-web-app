import { Module } from '@nestjs/common';

import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { ticketsProviders } from './tickets.providers';

@Module({
  providers: [TicketsService, ...ticketsProviders],
  controllers: [TicketsController],
})
export class TicketsModule {}
