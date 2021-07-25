import { IsEmail, IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Help {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @Column()
  title: string;

  @IsString()
  @Column({type: 'text'})
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

  @CreateDateColumn()
  timestamp: Date;
}
