import { Music } from './music.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Album {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userId: number;

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.albums, { primary: true, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Music, { cascade: true })
  @JoinTable()
  musics: Music[];
}
