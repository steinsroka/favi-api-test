import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { BeatCommentLike } from './beat-comment-like.entity';
import { BeatTag } from './beat-tag.entity';
import { Beat } from './beat.entity';
import { User } from './user.entity';

@Entity()
export class BeatComment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(() => BeatComment, (beatComment) => beatComment.children)
  parent: BeatComment;

  @OneToMany(() => BeatComment, (beatComment) => beatComment.parent)
  children: BeatComment[];

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Beat, (beat) => beat.beatComments, { nullable: false })
  beat: Beat;

  @ManyToOne(() => User, (user) => user.beatComments, { nullable: false, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(
    () => BeatCommentLike,
    (beatCommentLike) => beatCommentLike.beatComment,
    { cascade: true },
  )
  beatCommentLikes: BeatCommentLike[];

  @OneToMany(() => BeatTag, (beatTag) => beatTag.beatComment, {
    cascade: true,
  })
  beatTags: BeatTag[];
}
