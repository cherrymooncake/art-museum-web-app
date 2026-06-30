import { Exhibition } from './exhibition.entity';
import { EXHIBITION_REPOSITORY } from '../../core/constants';

export const exhibitionsProviders = [
    {
        provide: EXHIBITION_REPOSITORY,
        useValue: Exhibition,
    },
];
