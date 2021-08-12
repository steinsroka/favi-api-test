import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { MusicComment } from './music-comment.entity';
import { User } from './user.entity';

@Entity()
export class MusicCommentLike {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  musicCommentId: number;

  @ManyToOne(() => User, (user) => user.musicCommentLikes)
  user: User;

  @ManyToOne(
    () => MusicComment,
    (musicComment) => musicComment.musicCommentLikes,
    { onDelete: 'CASCADE' },
  )
  musicComment: MusicComment;

  @CreateDateColumn()
  timestamp: Date;
}
