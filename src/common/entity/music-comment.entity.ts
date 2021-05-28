import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { MusicTagValue } from './music-tag-value.entity';
import { MusicTag } from './music-tag.entity';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class MusicComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Music, (music) => music.comments)
  music: Music;

  @ManyToOne(() => User, (user) => user.musicComments)
  user: User;

  @ManyToMany(() => User, (user) => user.musicCommentLikes)
  likedUsers: User[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTag: MusicTag[];
}
