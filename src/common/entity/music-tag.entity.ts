import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MusicComment } from './music-comment.entity';
import { MusicTagValue } from './music-tag-value.entity';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class MusicTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  musicId: string;

  @Column()
  musicCommentId: number;

  @Column('uuid')
  userId: string;

  @Column()
  musicTagValueId: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Music, (music) => music.musicTags)
  music: Music;

  @ManyToOne(() => MusicComment, (musicComment) => musicComment.musicTags)
  musicComment: MusicComment;

  @ManyToOne(() => User, (user) => user.musicTags)
  user: User;

  @ManyToOne(() => MusicTagValue, (musicTagValue) => musicTagValue.musicTags)
  musicTagValue: MusicTagValue;
}
