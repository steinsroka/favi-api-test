import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Music } from './music.entity';
import { User } from './user.entity';

@Entity()
export class TesterMusic {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Music, (music) => music.testerMusics)
  @JoinTable()
  musics: Music[];
}
