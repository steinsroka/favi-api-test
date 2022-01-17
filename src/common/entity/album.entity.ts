import { Music } from './music.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { MusicTagValue } from './music-tag-value.entity';

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

  @ManyToOne(() => User, (user) => user.albums, {
    primary: true,
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToMany(() => Music, { cascade: true })
  @JoinTable()
  musics: Music[];

  @ManyToMany(() => MusicTagValue, { cascade: true })
  @JoinTable({
    name: 'album_tags',
  })
  tags: MusicTagValue[];

  @DeleteDateColumn()
  deletedAt?: Date;
}
