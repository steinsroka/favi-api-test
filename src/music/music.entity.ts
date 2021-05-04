import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Music {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  composer: string;

  @Column()
  lyricist: string;

  @Column()
  album: string;

  @Column({ type: 'text' })
  lyrics: string;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'dates' })
  dates: Date;

  @Column()
  country: string;

  @Column()
  link: string;

  @Column({ type: 'boolean' })
  valid: boolean;
}
