import { OmitType } from '@nestjs/mapped-types';
import {
  IsBase64,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
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
import { MusicComment } from './music-comment.entity';
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
  @Column({ select: false })
  password: string;

  @IsBase64()
  @Column({ select: false, name: 'pw_salt' })
  pwSalt: string;

  @IsString()
  @Column({
    nullable: true,
  })
  name: string;

  @IsDate()
  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'age',
  })
  birth: Date;

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

  @OneToMany(() => Album, (album) => album.user, { cascade: true })
  albums: Album[];

  @OneToMany(() => MusicComment, (musicComment) => musicComment.user)
  musicComments: MusicComment[];

  @ManyToMany(() => Music, (music) => music.likedUsers)
  @JoinTable()
  musicLikes: Music[];

  @ManyToMany(() => MusicComment, (musicComment) => musicComment.likedUsers)
  musicCommentLikes: MusicComment[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTag: MusicTag[];
}

export class UserExceptRelations extends OmitType(User, [
  'albums',
  'musicComments',
  'musicLikes',
  'musicTag',
]) {}
