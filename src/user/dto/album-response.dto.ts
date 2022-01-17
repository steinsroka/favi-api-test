import { IntersectionType } from '@nestjs/mapped-types';
import { Album } from '../../common/entity/album.entity';

class representImage {
  representImageId: number;
  musicCount: number;
}

export class AlbumResponseDto extends IntersectionType(Album, representImage) {}
