import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserAlbum } from './userAlbum.entity';

export enum Gender {
  MEN = 'men',
  WOMEN = 'women',
  DEFAULT = 'default',
}

@Entity()
export class User {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true
  })
  email: string;

  @Column()
  password: string;

  @Column()
  pw_salt: string;

  @Column({
    nullable: true
  })
  name: string;

  @Column({
    nullable: true
  })
  age: number;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true
  })
  gender: Gender;

  @Column({ type: 'timestamp', default: () => 'now()', name: 'register_date' })
  timestamp: Date;

  @Column({
    default: 1
  })
  level: number;

  @OneToMany(() => UserAlbum, (album) => album.user)
  albums: UserAlbum[];
}
