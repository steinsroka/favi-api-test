import { Column, Entity, JoinTable, OneToMany, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Music } from './music.entity';
import { MusicTag } from './music-tag.entity';

@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Music, (music) => music.artists)
  @JoinTable()
  musics: Music[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.musicTagValue, { cascade: true })
  artistTags: MusicTag[];
  // @Column()
  // tags: MusicTag[];

}
