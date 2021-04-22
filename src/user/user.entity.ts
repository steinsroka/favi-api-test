import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserAlbum } from './userAlbum.entity';

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  DEFAULT = 'default',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  pw_salt: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'register_date' })
  timestamp: Date;

  @Column()
  level: number;

  @OneToMany(() => UserAlbum, (album) => album.user)
  albums: UserAlbum[];
}
