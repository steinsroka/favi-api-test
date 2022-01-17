import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

// 문의 종류, suggestion : 건의, 이후에 뭐 payment(결제 문제) 등 추가해서 사용..
export enum helpType {
  suggestion = 'suggestion',
}

@Entity()
export class Help {
  @ApiProperty({
    example: '1',
    description: '문의사항의 고유 ID',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '문의사항 제목입니다',
    description: '문의사항 제목',
  })
  @IsString()
  @Column()
  title: string;

  @ApiProperty({
    example: '문의사항 내용입니다',
    description: '문의사항 내용',
  })
  @IsString()
  @Column({ type: 'text' })
  contents: string;

  @ApiProperty({
    example: 'example@example.com',
    description: '연락 받을 이메일',
  })
  @IsEmail()
  @Column()
  email: string;

  @ApiProperty({
    example: 'suggestion',
    description: '어떤 관련된 문제인지 대분류',
  })
  @IsEnum(helpType)
  @Column()
  type: helpType;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  timestamp: Date;
}
