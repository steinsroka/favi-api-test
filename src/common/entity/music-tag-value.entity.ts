import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { MusicTag } from './music-tag.entity';

export enum TagClass {
  EMOTION = 'emotion',
  GENRE = 'genre',
  SITUATION = 'situation',
  INSTRUCTION = 'instruction',
  RHYTHM = 'rhythm_beat',
  VOCAL = 'vocal',
  OTHER = 'other',
}

export enum Tag {
  ACCOUSTIC = 'accoustic',
  CLASSIC = 'classic',
  ELECTRIC = 'electric',
  JAZZ = 'jazz',
  RNB = 'R&B',
  SOUL = 'soul',
  METAL = 'metal',
  POP = 'pop',
  HIPHOP = 'hiphop',
  TROT = 'trot',
  BALLADE = 'ballade',
  DISCO = 'disco',
  PUNK = 'punk',
  OST = 'ost',
  BLUES = 'blues',
  ANGRY = 'angry',
  LOVE = 'love',
  HAPPY = 'happy',
  SAD = 'sad',
  ENJOY = 'enjoy',
  COURAGE = 'courage',
  LONELY = 'lonely',
  CONSOLATION = 'consolation',
  CONFIDENCE = 'confidence',
  BOREDOM = 'boredom',
  DRUM = 'drum',
  BASS = 'bass',
  BRASS = 'brass',
  PIANO = 'pinao_keyboard',
  STRING = 'string',
  ELECTRIC_GUITAR = 'electric_guitar',
  //TODO: more tag
}

//TODO: tag, subtag replace string to enum class
@Entity()
export class MusicTagValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tag: Tag;

  @Column({ nullable: true })
  subTag!: string;

  @Column({
    type: 'enum',
    enum: TagClass,
  })
  class: TagClass;

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTags: MusicTag[];
}
