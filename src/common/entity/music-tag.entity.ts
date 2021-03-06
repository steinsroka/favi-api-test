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

  @Column()
  musicId: number;

  @Column({ nullable: true })
  musicCommentId: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  musicTagValueId: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Music, (music) => music.musicTags)
  music: Music;

  @ManyToOne(() => MusicComment, (musicComment) => musicComment.musicTags, {
    onDelete: 'CASCADE',
  })
  musicComment: MusicComment;

  @ManyToOne(() => User, (user) => user.musicTags, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User;

  @ManyToOne(() => MusicTagValue, (musicTagValue) => musicTagValue.musicTags)
  musicTagValue: MusicTagValue;
}
