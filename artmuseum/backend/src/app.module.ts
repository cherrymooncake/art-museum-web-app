import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { ExhibitionsModule } from './modules/exhibitions/exhibitions.module';
import { ArtworksModule } from './modules/artworks/artworks.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import {DefaultDataModule} from './modules/default-data/default-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    TicketsModule,
    ExhibitionsModule,
    ArtworksModule,
    ReservationsModule,
    DefaultDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
