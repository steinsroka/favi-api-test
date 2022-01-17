import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Music } from './music.entity';
import { MusicInfo } from '../view/music-info.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Music, (music) => music.artists)
  @JoinTable()
  musics: MusicInfo[];
}
