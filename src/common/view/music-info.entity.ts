import { TagCountDto } from '../../music/dto/tag-count.dto';
import { ViewEntity, ViewColumn, Connection } from 'typeorm';
import { MusicTagValue } from '../entity/music-tag-value.entity';
import { Music } from '../entity/music.entity';
import { User } from '../entity/user.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('music.id', 'id')
      .addSelect('music.title', 'title')
      .addSelect('music.composer', 'composer')
      .addSelect('music.lyricist', 'lyricist')
      .addSelect('music.link', 'link')
      .addSelect(
        'CASE WHEN user.id is null then 0 ELSE COUNT(music.id) END',
        'like',
      )
      .from(Music, 'music')
      .leftJoin('music.musicLikes', 'musicLike')
      .leftJoin('musicLike.user', 'user')
      .groupBy('music.id'),
})
export class MusicInfo {
  @ViewColumn()
  id: string;

  @ViewColumn()
  title: string;

  @ViewColumn()
  composer: string;

  @ViewColumn()
  lyricist: string;

  @ViewColumn()
  link: string;

  @ViewColumn()
  like: number;

  tags: TagCountDto[];
}
