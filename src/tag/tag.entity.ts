import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TagClass,
  })
  class: TagClass;
}
