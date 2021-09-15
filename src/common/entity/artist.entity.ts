import { Column, Entity, JoinTable, OneToMany, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Music } from './music.entity';
import { MusicTag } from './music-tag.entity';
import { MusicTagInfo } from './view/music-tag-info.entity';
@Entity()
export class Artist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Music, (music) => music.artists)
  @JoinTable()
  musics: Music[];

  @OneToMany(() => MusicTagInfo, { cascade: true })
  artistTags: MusicTagInfo[];
}
