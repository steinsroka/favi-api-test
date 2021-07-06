import { Tag, TagClass } from '../../common/entity/music-tag-value.entity';

export class UserLikedAlbumDto {
  name: Tag;

  class: TagClass;

  parent: Tag;

  musicId: number;

  count: number;
}
