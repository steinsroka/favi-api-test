import { MusicCommentTagDto } from '../../music/dto/music-comment-tag.dto';
import { ViewEntity, ViewColumn, Connection } from 'typeorm';
import { MusicComment } from '../entity/music-comment.entity';
import { MusicTagValue } from '../entity/music-tag-value.entity';
import { Music } from '../entity/music.entity';
import { User } from '../entity/user.entity';
import { MusicTagInfo } from './music-tag-info.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('MIN(musicComment.id)', 'id')
      .addSelect('MIN(musicComment.musicId)', 'musicId')
      .addSelect('MIN(musicComment.comment)', 'comment')
      .addSelect('MIN(musicComment.timestamp)', 'timestamp')
      .addSelect('MIN(user.name)', 'userName')
      .addSelect('MIN(user.id)', 'userId')
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
  userId: number;

  @ViewColumn()
  musicId: number;

  @ViewColumn()
  comment: string;

  @ViewColumn()
  timestamp: Date;

  @ViewColumn()
  like: number;

  @ViewColumn()
  userName: string;

  tags: MusicCommentTagDto[];
}
