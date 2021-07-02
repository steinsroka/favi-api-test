import { ViewEntity, ViewColumn, Connection } from 'typeorm';
import { MusicTagValue } from '../entity/music-tag-value.entity';
import { Music } from '../entity/music.entity';
import { User } from '../entity/user.entity';
import { MusicTagInfo } from './music-tag-info.entity';

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
        'COUNT(musicLike.userId)',
        'likedUserCount',
      )
      .from(Music, 'music')
      .leftJoin('music.musicLikes', 'musicLike')
      .groupBy('music.id'),
})
export class MusicInfo {
  @ViewColumn()
  id: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  composer: string;

  @ViewColumn()
  lyricist: string;

  @ViewColumn()
  link: string;

  @ViewColumn()
  likedUserCount: number;

  tags: MusicTagInfo[];
}
