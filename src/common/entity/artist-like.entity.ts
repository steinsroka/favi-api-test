import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Artist } from './artist.entity';
import { User } from './user.entity';

@Entity()
@Unique('unique block', ['likingUser', 'likedArtist'])
export class artistLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '432',
    description: '좋아요 누른 유저',
  })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  likingUser: User;

  @ApiProperty({
    example: '32',
    description: '좋아요 당한 아티스트',
  })
  @ManyToOne(() => Artist, { onDelete: 'CASCADE' })
  likedArtist: Artist;

  @CreateDateColumn()
  timestamp: Date;
}
