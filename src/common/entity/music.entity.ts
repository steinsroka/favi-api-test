import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { MusicComment } from './music-comment.entity';
import { MusicLike } from './music-like.entity';
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
  link: string;

  @OneToMany(() => MusicComment, (musicComment) => musicComment.music, {
    cascade: true,
  })
  musicComments: MusicComment[];

  @OneToMany(() => MusicLike, (musicLike) => musicLike.music, { cascade: true })
  musicLikes: MusicLike[];

  @OneToMany(() => MusicTag, (musicTag) => musicTag.music, { cascade: true })
  musicTags: MusicTag[];
}
