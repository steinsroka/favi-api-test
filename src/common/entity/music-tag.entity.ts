import {
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

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Music, (music) => music.musicTag)
  music: Music;

  @ManyToOne(() => MusicComment, (musicComment) => musicComment.musicTag)
  musicComment!: MusicComment;

  @ManyToOne(() => User, (user) => user.musicTag)
  user: User;

  @ManyToOne(() => MusicTagValue, (musicTagValue) => musicTagValue.musicTag)
  musicTagValue: MusicTagValue;
}
