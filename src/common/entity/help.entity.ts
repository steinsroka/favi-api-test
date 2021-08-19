import { IsEmail, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Help {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column({ type: 'text' })
  contents: string;

  @IsEmail()
  @Column()
  email: string;

  @IsString()
  @Column()
  type: string;

  @IsString()
  @Column()
  name: string;

  @OneToOne(() => User, {onDelete: 'SET NULL'})
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  timestamp: Date;
}
