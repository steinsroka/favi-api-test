import { MusicCommentTagDto } from '../../music/dto/music-comment-tag.dto';
import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { User,Age,Gender } from '../entity/user.entity';
import { MusicLike } from '../entity/music-like.entity';
import { UserFollow } from '../entity/user-follow.entity';
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
            .from(UserFollow, 'userFollow')
            .where('userFollow.userId = user.id'),
        'followingCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('COUNT(*)')
            .from(UserFollow, 'userFollow')
            .where('userFollow.followUserId = user.id'),
        'followerCount',
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
  age: Age;

  @ViewColumn()
  gender: Gender;

  @ViewColumn()
  testEnd: Date;

  @ViewColumn()
  followingCount: number;

  @ViewColumn()
  followerCount: number;

  @ViewColumn()
  likedMusicCount: number;

  @ViewColumn()
  commentCount: number;

  tags: UserTagInfo[];
}
