import { Module } from '@nestjs/common';

import { ArtworksService } from './artworks.service';
import { ArtworksController } from './artworks.controller';
import { artworksProviders } from './artworks.providers';

@Module({
  providers: [ArtworksService, ...artworksProviders],
  controllers: [ArtworksController],
})
export class ArtworksModule {}
