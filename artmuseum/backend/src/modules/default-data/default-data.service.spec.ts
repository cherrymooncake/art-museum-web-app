import { Test, TestingModule } from '@nestjs/testing';
import { DefaultDataService } from './default-data.service';

describe('DefaultDataService', () => {
  let service: DefaultDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultDataService],
    }).compile();

    service = module.get<DefaultDataService>(DefaultDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
