import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class MusicLike {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  musicId: number;

  @ManyToOne(() => User, (user) => user.musicLikes, { onDelete: "SET NULL" })
  user: User;

  @ManyToOne(() => Music, (music) => music.musicLikes)
  music: Music;

  @CreateDateColumn()
  timestamp: Date;
}
