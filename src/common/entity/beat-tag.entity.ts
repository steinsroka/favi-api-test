import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import { MusicComment } from './music-comment.entity';
import { BeatTagValue } from './beat-tag-value.entity';
import { Beat } from './beat.entity';
import { User } from './user.entity';

@Entity()
export class BeatTag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  beatId: number;

  // @Column({ nullable: true })
  // beatCommentId: number;

  @Column({nullable: true})
  userId: number;

  @Column()
  beatTagValueId: number;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Beat, (beat) => beat.beatTags)
  beat: Beat;

  // @ManyToOne(() => BeatComment, (beatComment) => beatComment.beatTags, {
  //   onDelete: 'CASCADE',
  // })
  // beatComment: BeatComment;

  // @ManyToOne(() => User, (user) => user.musicTags, {onDelete: 'SET NULL', nullable: true})
  // user: User;

  @ManyToOne(() => BeatTagValue, (beatTagValue) => beatTagValue.beatTags)
  beatTagValue: BeatTagValue;
}
