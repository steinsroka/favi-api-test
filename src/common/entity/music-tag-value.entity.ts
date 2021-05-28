import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { MusicComment } from './music-comment.entity';
import { MusicTag } from './music-tag.entity';

export enum TagClass {
  EMOTION = 'emotion',
  GENRE = 'genre',
  SITUATION = 'situation',
  WEATHER = 'weather',
  INSTRUCTION = 'instruction',
  RHYTHM = 'rhythm',
  VOCAL = 'vocal',
}

@Entity()
export class MusicTagValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tag: string;

  @Column()
  subTag!: string;

  @Column({
    type: 'enum',
    enum: TagClass,
  })
  class: TagClass;

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTag: MusicTag[];
}
