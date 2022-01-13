import {
  IsBase64,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
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
import { MusicCommentLike } from './music-comment-like.entity';
import { MusicComment } from './music-comment.entity';
import { BeatCommentLike } from './beat-comment-like.entity';
import { BeatComment } from './beat-comment.entity';
import { MusicLike } from './music-like.entity';
import { BeatLike } from './beat-like.entity';
import { MusicTag } from './music-tag.entity';
import { Music } from './music.entity';
import { UserFollow } from './user-follow.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserBlock } from './user-block.entity';

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  DEFAULT = 'default',
}

export enum Age {
  A = 10,
  B = 20,
  C = 30,
  D = 40,
  E = 50
}

@Entity()
export class User {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  @ApiProperty({
    example: "1",
    description: "유저의 고유 ID"
  })
  @IsNumber()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: "wahowed331@zoeyy.com",
    description: "유저 email"
  })
  @IsEmail()
  @Column({
    unique: true,
  })
  email: string;

  @IsBase64()
  @Column({select : false})
  password: string;

  @IsBase64()
  @Column({ name: 'pw_salt', select: false })
  pwSalt: string;


  @ApiProperty({
    example: "휘군",
    description: "유저의 닉네임"
  })
  @IsOptional()
  @IsString()
  @Column({
    nullable: true,
  })
  name: string;

  @ApiProperty({
    example: "20",
    description: "유저의 연령대",
    enum : Age
  })
  @IsOptional()
  @IsEnum(Age)
  @Column({ type: 'enum', enum: Age, nullable: true })
  age: number;

  @ApiProperty({
    example: "women",
    description: "유저의 성별",
    enum : Gender
  })
  @IsOptional()
  @IsEnum(Gender)
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @ApiProperty({
    example: "2021-02-26 07:06:30.000000",
    description: "등록 시간",
  })
  @IsDate()
  @CreateDateColumn()
  timestamp: Date;


  @ApiProperty({
    example: "1",
    description: "유저의 권한",
  })
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

  @IsBoolean()
  @Column({default : true})
  isLikePublic : boolean;


  @OneToMany(() => Album, (album) => album.user, {cascade: true})
  albums: Album[];

  @OneToMany(() => MusicComment, (musicComment) => musicComment.user, {cascade: true})
  musicComments: MusicComment[];

  @OneToMany(() => BeatComment, (beatComment) => beatComment.user, {cascade: true})
  beatComments: BeatComment[];

  @OneToMany(() => MusicLike, (musicLike) => musicLike.user, {cascade: true})
  musicLikes: MusicLike[];

  @OneToMany(() => UserFollow, (userFollow) => userFollow.user, {cascade: true})
  userFollows: UserFollow[];

  @OneToMany(() => UserBlock, (userBlock) => userBlock.blockingUser, {cascade: true})
  blockingUser: UserBlock[];

  @OneToMany(() => BeatLike, (beatLike) => beatLike.user, {cascade: true})
  beatLikes: BeatLike[];

  @OneToMany(
    () => MusicCommentLike,
    (musicCommentLike) => musicCommentLike.user,
    {cascade: true}
  )
  musicCommentLikes: MusicCommentLike[];

  @OneToMany(
    () => BeatCommentLike,
    (beatCommentLike) => beatCommentLike.user,
    {cascade: true}
  )
  beatCommentLikes: BeatCommentLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music, {cascade: true})
  musicTags: MusicTag[];

  @ManyToMany(() => Music, (music) => music.testerMusicUsers, {cascade: true})
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
