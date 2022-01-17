import { ApiProperty } from '@nestjs/swagger';
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserFollow {
  @ApiProperty({
    example: '432',
    description: '팔로우를 건 유저',
  })
  @PrimaryColumn()
  userId: number;

  @ApiProperty({
    example: '32',
    description: '팔로우를 당한 유저',
  })
  @PrimaryColumn()
  followUserId: number;

  @ManyToOne(() => User, (user) => user.userFollows, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  timestamp: Date;
}
