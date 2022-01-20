import { IntersectionType } from '@nestjs/swagger';
import { Artist } from '../../common/entity/artist.entity';

export class ArtistWithLikeDto extends IntersectionType(
  Artist,
  class like {
    LikedUserCount: number;
  },
) {}
