import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class TesterMusic {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Music, (music) => music.testerMusic)
  musics: Music[];
}
