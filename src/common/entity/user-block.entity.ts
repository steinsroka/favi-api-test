import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique('unique block', ['blockingUser', 'blockedUser'])
export class UserBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '432',
    description: '블락을 건 유저',
  })
  @ManyToOne(() => User, (user) => user.blockingUser, { onDelete: 'CASCADE' })
  blockingUser: User;

  @ApiProperty({
    example: '32',
    description: '블락을 당한 유저',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  blockedUser: User;

  @CreateDateColumn()
  timestamp: Date;
}
