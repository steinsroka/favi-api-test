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
      .addSelect('music.album', 'album')
      .addSelect('music.lyrics', 'lyrics')
      .addSelect('music.dates', 'dates')
      .addSelect('music.country', 'country')
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
  id: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  composer: string;

  @ViewColumn()
  lyricist: string;

  @ViewColumn()
  album: string;

  @ViewColumn()
  lyrics: string;

  @ViewColumn()
  dates: Date;

  @ViewColumn()
  country: string;

  @ViewColumn()
  link: string;

  @ViewColumn()
  like: number;
}
