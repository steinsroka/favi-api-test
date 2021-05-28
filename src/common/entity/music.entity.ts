import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { MusicComment } from './music-comment.entity';
import { MusicTag } from './music-tag.entity';
import { User } from './user.entity';

@Entity()
export class Music {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  composer: string;

  @Column()
  lyricist: string;

  @Column()
  album: string;

  @Column({ type: 'text' })
  lyrics: string;

  @Column({ type: 'timestamp' })
  dates: Date;

  @Column()
  country: string;

  @Column()
  link: string;

  @Column({ type: 'boolean' })
  valid: boolean;

  @OneToMany(() => MusicComment, (musicComment) => musicComment.music)
  comments: MusicComment[];

  @ManyToMany(() => User, (user) => user.musicLikes)
  likedUsers: User[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music)
  musicTag: MusicTag[];
}
