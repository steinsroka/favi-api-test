import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { ArtistService } from '../artist.service';

@Injectable()
export class ValidateArtistPipe implements PipeTransform {
  constructor(private readonly artistService: ArtistService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'param') {
      switch (metadata.data) {
        case 'artist_id':
          if (!(await this.artistService.isExistArtist(value))) {
            throw new NotFoundException(`artist id ${value} is not exist`);
          }
          break;
      }
    }
    return value;
  }
}
