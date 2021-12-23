import {
  ViewEntity,
  ViewColumn,
  Connection,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
// import { Artist } from '../entity/artist.entity';
// import { MusicTagValue } from '../entity/music-tag-value.entity';
import {
  BPM,
  Copyright,
  Language,
  MelodyScale,
  Music,
  RhythmBeat,
  VocalType,
} from '../entity/music.entity';
import { Beat } from '../entity/beat.entity';
import { User } from '../entity/user.entity';
// import { MusicTagInfo } from './music-tag-info.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('beat.id', 'id')
      .addSelect('beat.title', 'title')
      // .addSelect('music.composer', 'composer')
      // .addSelect('music.lyricist', 'lyricist')
      .addSelect('beat.contents', 'contents')
      // .addSelect('beat.vocalType', 'vocalType')
      .addSelect('beat.language', 'language')
      // .addSelect('beat.rhythmBeat', 'rhythmBeat')
      .addSelect('beat.bpm', 'bpm')
      .addSelect('beat.melodyScale', 'melodyScale')
      // .addSelect('music.copyright', 'copyright')
      .addSelect('COUNT(beatLike.userId)', 'likedUserCount')
      // .addSelect('COUNT(musicComment.userId)', 'commentedCount')
      .from(Beat, 'beat')
      .leftJoin('beat.beatLikes', 'beatLike')
      // .leftJoin('music.musicComments', 'musicComment')
      .groupBy('beat.id'),
})
export class MusicInfo {
  @ViewColumn()
  id: number;

  @ViewColumn()
  title: string;

  @ViewColumn()
  contents: string;

  @ViewColumn()
  likedUserCount: number;

  // @ViewColumn()
  // commentedCount: number;

  // @ViewColumn()
  // vocalType: VocalType;

  @ViewColumn()
  language: Language;

  // @ViewColumn()
  // rhythmBeat: RhythmBeat;

  @ViewColumn()
  bpm: BPM;

  @ViewColumn()
  melodyScale: MelodyScale;

  // @ViewColumn()
  // copyright: Copyright;
  //
  // artists: Artist[];
  //
  // tags: MusicTagInfo[];

  myLike: boolean;
}
