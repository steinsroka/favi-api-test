import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { MusicCommentLike } from './music-comment-like.entity';
import { MusicTag } from './music-tag.entity';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class MusicComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => MusicComment, (musicComment) => musicComment.children)
  parent: MusicComment;

  @OneToMany(() => MusicComment, (musicComment) => musicComment.parent)
  children: MusicComment[];

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Music, (music) => music.musicComments, { nullable: false })
  music: Music;

  @ManyToOne(() => User, (user) => user.musicComments, { nullable: false, onDelete: 'SET NULL' })
  user: User;

  @OneToMany(
    () => MusicCommentLike,
    (musicCommentLike) => musicCommentLike.musicComment,
    { cascade: true },
  )
  musicCommentLikes: MusicCommentLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.musicComment, {
    cascade: true,
  })
  musicTags: MusicTag[];
}
