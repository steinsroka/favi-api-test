import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { BeatComment } from './beat-comment.entity';
import { User } from './user.entity';

@Entity()
export class BeatCommentLike {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  beatCommentId: number;

  @ManyToOne(() => User, (user) => user.beatCommentLikes, {onDelete: 'CASCADE'})
  user: User;

  @ManyToOne(
    () => BeatComment,
    (beatComment) => beatComment.beatCommentLikes,
    { onDelete: 'CASCADE' },
  )
  beatComment: BeatComment;

  @CreateDateColumn()
  timestamp: Date;
}
