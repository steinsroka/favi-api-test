import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Artist } from './artist.entity';
import { MusicComment } from './music-comment.entity';
import { MusicLike } from './music-like.entity';
import { MusicTag } from './music-tag.entity';
import { User } from './user.entity';

//TODO: fill enum value
export enum VocalType {
  T = 't',
}

export enum Language {
  T = 't',
}

export enum RhythmBeat {
  T = 't',
}

export enum BPM {
  T = 't',
}

export enum MelodyScale {
  T = 't',
}

export enum Copyright {
  T = 't',
}

@Entity()
export class Music {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  composer: string;

  @Column({ nullable: true })
  lyricist: string;

  @Column({ type: 'text', nullable: true })
  lyrics: string;

  @Column({ type: 'date', nullable: true })
  dates: Date;

  @Column({ nullable: true })
  album: string;

  @Column({ type: 'enum', enum: VocalType, nullable: true })
  vocalType: VocalType;

  @Column({ type: 'enum', enum: Language, nullable: true })
  language: Language;

  @Column({ type: 'enum', enum: RhythmBeat, nullable: true })
  rhythmBeat: RhythmBeat;

  @Column({ type: 'enum', enum: BPM, nullable: true })
  bpm: BPM;

  @Column({ type: 'enum', enum: MelodyScale, nullable: true })
  melodyScale: MelodyScale;

  @Column({ type: 'enum', enum: Copyright, nullable: true })
  copyright: Copyright;

  @Column({ nullable: true })
  link: string;

  @OneToMany(() => MusicComment, (musicComment) => musicComment.music, {
    cascade: true,
  })
  musicComments: MusicComment[];

  @OneToMany(() => MusicLike, (musicLike) => musicLike.music, { cascade: true })
  musicLikes: MusicLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music, { cascade: true })
  musicTags: MusicTag[];

  @ManyToMany(() => Artist, (artist) => artist.musics)
  @JoinTable()
  artists: Artist[];
}
