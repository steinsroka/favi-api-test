import { MusicCommentTagDto } from '../../music/dto/music-comment-tag.dto';
import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { User } from '../entity/user.entity';
import { MusicLike } from '../entity/music-like.entity';
import { MusicComment } from '../entity/music-comment.entity';
import { UserTagInfo } from './user-tag-info.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('user.id', 'id')
      .addSelect('user.name', 'name')
      .addSelect('user.email', 'email')
      .addSelect('user.age', 'age')
      .addSelect('user.gender', 'gender')
      .addSelect('user.testEnd', 'testEnd')
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(MusicLike, 'musicLike')
            .where('musicLike.userId = user.id'),
        'likedMusicCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(MusicComment, 'musicComment')
            .where('musicComment.userId = user.id'),
        'commentCount',
      )
      .from(User, 'user'),
})
export class UserInfo {
  @ViewColumn()
  id: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  age: number;

  @ViewColumn()
  gender: string;

  @ViewColumn()
  testEnd: Date;

  @ViewColumn()
  likedMusicCount: number;

  @ViewColumn()
  commentCount: number;

  tags: UserTagInfo[];
}
