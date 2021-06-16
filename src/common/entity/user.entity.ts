import { OmitType, PickType } from '@nestjs/mapped-types';
import {
  IsBase64,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
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

  @IsUUID()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @OneToMany(() => MusicLike, (musicLike) => musicLike.user)
  musicLikes: MusicLike[];

  @OneToMany(
    () => MusicCommentLike,
    (musicCommentLike) => musicCommentLike.user,
  )
  musicCommentLikes: MusicCommentLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTags: MusicTag[];
}

export class UserAuthInfo extends PickType(User, [
  'id',
  'email',
  'password',
  'pwSalt',
  'name',
  'birth',
  'gender',
  'timestamp',
  'level',
]) {}
