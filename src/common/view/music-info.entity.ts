import {
  ViewEntity,
  ViewColumn,
  Connection,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { Artist } from '../entity/artist.entity';
import { MusicTagValue } from '../entity/music-tag-value.entity';
import {
  BPM,
  Copyright,
  Language,
  MelodyScale,
  Music,
  RhythmBeat,
  VocalType,
} from '../entity/music.entity';
import { User } from '../entity/user.entity';
import { MusicTagInfo } from './music-tag-info.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('music.id', 'id')
      .addSelect('music.title', 'title')
      // .addSelect('music.composer', 'composer')
      // .addSelect('music.lyricist', 'lyricist')
      .addSelect('music.link', 'link')
      .addSelect('music.vocalType', 'vocalType')
      .addSelect('music.language', 'language')
      .addSelect('music.rhythmBeat', 'rhythmBeat')
      .addSelect('music.bpm', 'bpm')
      .addSelect('music.melodyScale', 'melodyScale')
      .addSelect('music.copyright', 'copyright')
      .addSelect('COUNT(musicLike.userId)', 'likedUserCount')
      .addSelect('COUNT(musicComment.userId)', 'commentedCount')
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
  link: string;

  @ViewColumn()
  likedUserCount: number;

  @ViewColumn()
  commentedCount: number;

  @ViewColumn()
  vocalType: VocalType;

  @ViewColumn()
  language: Language;

  @ViewColumn()
  rhythmBeat: RhythmBeat;

  @ViewColumn()
  bpm: BPM;

  @ViewColumn()
  melodyScale: MelodyScale;

  @ViewColumn()
  copyright: Copyright;

  artists: Artist[];

  tags: MusicTagInfo[];

  myLike: boolean;
}
