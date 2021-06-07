import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Music } from "./music.entity";
import { User } from "./user.entity";

@Entity()
export class MusicLike {
  @PrimaryColumn('uuid', {length: 36})
  userId: string;

  @PrimaryColumn('uuid', {length: 36})
  musicId: string;

  @ManyToOne(() => User, (user) => user.musicLikes)
  user: User;

  @ManyToOne(() => Music, (music) => music.musicLikes)
  music: Music;

  @CreateDateColumn()
  timestamp: Date;
}