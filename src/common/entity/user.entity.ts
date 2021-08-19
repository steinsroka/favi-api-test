import { OmitType, PickType } from '@nestjs/mapped-types';
import {
  IsBase64,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Album } from './album.entity';
import { MusicCommentLike } from './music-comment-like.entity';
import { MusicComment } from './music-comment.entity';
import { MusicLike } from './music-like.entity';
import { MusicTag } from './music-tag.entity';
import { Music } from './music.entity';

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  DEFAULT = 'default',
}

@Entity()
export class User {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @IsEmail()
  @Column({
    unique: true,
  })
  email: string;

  @IsBase64()
  @Column()
  password: string;

  @IsBase64()
  @Column({ name: 'pw_salt' })
  pwSalt: string;

  @IsOptional()
  @IsString()
  @Column({
    nullable: true,
  })
  name: string;

  @IsOptional()
  @Matches(/10+20+30+40+50/)
  @Column({ nullable: true })
  age: number;

  @IsOptional()
  @IsEnum(Gender)
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @IsDate()
  @CreateDateColumn()
  timestamp: Date;

  @IsNumber()
  @Column({
    default: 1,
  })
  level: number;

  @IsOptional()
  @IsDate()
  @Column({ nullable: true })
  testEnd: Date;

  @IsOptional()
  @IsDate()
  @Column({ nullable: true })
  proEnd: Date;

  @IsOptional()
  @IsNumber()
  @Column({ nullable: true })
  totalTesterMusicCount: number;

  @OneToMany(() => Album, (album) => album.user, { cascade: true })
  albums: Album[];

  @OneToMany(() => MusicComment, (musicComment) => musicComment.user)
  musicComments: MusicComment[];

  @OneToMany(() => MusicLike, (musicLike) => musicLike.user)
  musicLikes: MusicLike[];

  @OneToMany(
    () => MusicCommentLike,
    (musicCommentLike) => musicCommentLike.user,
  )
  musicCommentLikes: MusicCommentLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTags: MusicTag[];

  @ManyToMany(() => Music, (music) => music.testerMusicUsers)
  @JoinTable({ name: 'tester_music' })
  testerMusics: Music[];
}

export class GuestUser extends User {
  constructor() {
    super('guest', 'guest');
    this.id = 0;
    this.name = 'guest';
  }
}