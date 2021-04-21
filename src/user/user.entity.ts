import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ type: 'timestamp', default: () => 'now()' })
  register_date: Date;

  @Column()
  level: number;
}
