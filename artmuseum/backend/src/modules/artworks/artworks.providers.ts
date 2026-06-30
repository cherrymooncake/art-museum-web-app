import { Artwork } from './artwork.entity';
import { ARTWORK_REPOSITORY } from '../../core/constants';

export const artworksProviders = [
    {
        provide: ARTWORK_REPOSITORY,
        useValue: Artwork,
    },
];
