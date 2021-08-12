import { IsDate, IsEnum, isNumber, IsNumber, IsString } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  timestamp: Date;
}
