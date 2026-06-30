import { Module } from '@nestjs/common';

import { ExhibitionsService } from './exhibitions.service';
import { ExhibitionsController } from './exhibitions.controller';
import { exhibitionsProviders } from './exhibitions.providers';

@Module({
  providers: [ExhibitionsService, ...exhibitionsProviders],
  controllers: [ExhibitionsController],
})
export class ExhibitionsModule {}
