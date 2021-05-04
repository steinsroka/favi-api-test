import { Music } from 'src/music/music.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../user.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  name: string;

  @Column({ default: true })
  public: boolean;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'dates' })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.albums)
  user: User;

  @ManyToMany(() => Music, { cascade: true })
  @JoinTable()
  musics: Music[];
}
