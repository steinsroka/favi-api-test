import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Music } from './music.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Music, (music) => music.artists)
  musics: Music[];
}
