import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Beat } from './beat.entity';
import { User } from './user.entity';

@Entity()
export class BeatLike {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  beatId: number;

  @ManyToOne(() => User, (user) => user.beatLikes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Music, (beat) => beat.beatLikes)
  beat: Beat;

  @CreateDateColumn()
  timestamp: Date;
}
