import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Music } from './music.entity';

@Entity()
export class MusicArtist {
  @PrimaryColumn()
  artistId: number;

  @PrimaryColumn()
  musicId: number;

}
