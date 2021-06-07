import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { MusicComment } from "./music-comment.entity";
import { User } from "./user.entity";

@Entity()
export class MusicCommentLike {
  @PrimaryColumn('uuid', {length: 36})
  userId: string;

  @PrimaryColumn()
  musicCommentId: number;

  @ManyToOne(() => User, (user) => user.musicCommentLikes)
  user: User;

  @ManyToOne(() => MusicComment, (musicComment) => musicComment.musicCommentLikes)
  musicComment: MusicComment;

  @CreateDateColumn()
  timestamp: Date;
}