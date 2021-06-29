import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Artist } from './artist.entity';
import { MusicComment } from './music-comment.entity';
import { MusicLike } from './music-like.entity';
import { MusicTag } from './music-tag.entity';
import { User } from './user.entity';

//TODO: fill enum value
export enum VocalType {

}

export enum Language {

}

export enum RhythmBeat {

}

export enum BPM {

}

export enum MelodyScale {

}

export enum Copyright {

}

@Entity()
export class Music {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  composer: string;

  @Column()
  lyricist: string;

  @Column({type: 'text'})
  lyrics: string;

  @Column({type: 'date'})
  dates: Date;

  @Column()
  album: string;

  @Column({type: 'enum', enum: VocalType})
  vocalType: VocalType;

  @Column({type: 'enum', enum: Language})
  language: Language;

  @Column({type: 'enum', enum: RhythmBeat})
  rhythmBeat: RhythmBeat;

  @Column({type: 'enum', enum: BPM})
  bpm: BPM;

  @Column({type: 'enum', enum: MelodyScale})
  melodyScale: MelodyScale;

  @Column({type: 'enum', enum: Copyright})
  copyright: Copyright;

  @Column()
  link: string;

  @OneToMany(() => MusicComment, (musicComment) => musicComment.music, {
    cascade: true,
  })
  musicComments: MusicComment[];

  @OneToMany(() => MusicLike, (musicLike) => musicLike.music, { cascade: true })
  musicLikes: MusicLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music, { cascade: true })
  musicTags: MusicTag[];

  @ManyToMany(() => Artist, artist => artist.musics)
  artists: Artist[];
}
