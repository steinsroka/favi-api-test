import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { Artist } from './artist.entity';
import { MusicComment } from './music-comment.entity';
import { MusicLike } from './music-like.entity';
import { MusicTag } from './music-tag.entity';
import { User } from './user.entity';

export enum VocalType {
  MEN = 'men',
  WOMEN = 'women',
  MIX = 'mix',
  GROUP = 'group',
}

export enum Language {
  KOREAN = 'korean',
  JAPANESE = 'japanese',
  ENGLISH = 'english',
  CHINESE = 'chinese',
  SPANISH = 'spanish',
  FRENCH = 'french',
  OTHER = 'other',
}

export enum RhythmBeat {
  HALFTIME = 'halftime',
  SHUFFLE = 'shuffle',
  STRAIGHT = 'straight',
  BOUNCE = 'bounce',
  WALTZ = 'waltz',
  GOGO = 'gogo',
  SWING = 'swing',
  TYPE = 'type',
}

export enum BPM {
  A = 0,
  B = 80,
  C = 90,
  D = 100,
  E = 110,
  F = 120,
}

export enum MelodyScale {
  MAJOR = 'major',
  MINOR = 'minor',
}

export enum Copyright {
  PD = 'pd',
  BY = 'by',
}

@Entity()
export class Music {
  @IsNumber()
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

  @IsDate()
  @Column({ type: 'date', nullable: true })
  dates: Date;

  @Column({ nullable: true })
  album: string;

  @IsEnum(VocalType)
  @Column({ type: 'enum', enum: VocalType, nullable: true })
  vocalType: VocalType;

  @IsEnum(Language)
  @Column({ type: 'enum', enum: Language, nullable: true })
  language: Language;

  @IsEnum(RhythmBeat)
  @Column({ type: 'enum', enum: RhythmBeat, nullable: true })
  rhythmBeat: RhythmBeat;

  @IsEnum(BPM)
  @Column({ type: 'enum', enum: BPM, nullable: true })
  bpm: BPM;

  @IsEnum(MelodyScale)
  @Column({ type: 'enum', enum: MelodyScale, nullable: true })
  melodyScale: MelodyScale;

  @IsEnum(Copyright)
  @Column({ type: 'enum', enum: Copyright, nullable: true })
  copyright: Copyright;

  @IsString()
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

  @ManyToMany(() => User, (user) => user.testerMusics)
  testerMusicUsers: User[];
}
