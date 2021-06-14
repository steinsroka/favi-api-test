import { TagCountDto } from '../../music/dto/tag-count.dto';
import { ViewEntity, ViewColumn, Connection } from 'typeorm';
import { MusicComment } from '../entity/music-comment.entity';
import { MusicTagValue } from '../entity/music-tag-value.entity';
import { Music } from '../entity/music.entity';
import { User } from '../entity/user.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('musicComment.id', 'id')
      .addSelect('musicComment.musicId', 'musicId')
      .addSelect('musicComment.comment', 'comment')
      .addSelect('musicComment.timestamp', 'timestamp')
      .addSelect('user.name', 'userName')
      .addSelect('user.id', 'userId')
      .addSelect(
        'CASE WHEN musicCommentLikes.user.id is null then 0 ELSE COUNT(musicComment.id) END',
        'like',
      )
      .from(MusicComment, 'musicComment')
      .leftJoin('musicComment.user', 'user')
      .leftJoin('musicComment.musicCommentLikes', 'musicCommentLikes')
      .groupBy('musicComment.id'),
})
export class MusicCommentInfo {
  @ViewColumn()
  id: number;

  @ViewColumn()
  userId: string;

  @ViewColumn()
  musicId: string;

  @ViewColumn()
  comment: string;

  @ViewColumn()
  timestamp: Date;

  @ViewColumn()
  like: number;

  @ViewColumn()
  userName: string;

  tags: TagCountDto[];
}
