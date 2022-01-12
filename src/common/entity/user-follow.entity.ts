import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
// import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class UserFollow {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  followUserId: number;

  @ManyToOne(() => User, (user) => user.userFollows, { onDelete: 'CASCADE' })
  user: User;


  @CreateDateColumn()
  timestamp: Date;
}
