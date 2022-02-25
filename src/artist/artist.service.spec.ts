import { Test, TestingModule } from '@nestjs/testing';
import { ArtistService } from './artist.service';

describe('ArtistService', () => {
  let service: ArtistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtistService],
    }).compile();

    service = module.get<ArtistService>(ArtistService);
  });
});
