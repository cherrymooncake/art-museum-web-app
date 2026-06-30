import { Global, Module } from '@nestjs/common';
import { DefaultDataService } from './default-data.service';
import { UsersService } from '../users/users.service';
import { usersProviders } from '../users/users.providers';

@Global()
@Module({
  providers: [DefaultDataService, UsersService,
    ...usersProviders],
  exports: [DefaultDataService],
})
export class DefaultDataModule {}
