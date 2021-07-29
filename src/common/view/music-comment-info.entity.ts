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
      .addSelect('MIN(musicComment.parentId)', 'parentId')
      .addSelect('MIN(user.name)', 'userName')
      .addSelect('MIN(user.id)', 'userId')
      .addSelect(
        'COUNT(musicCommentLikes.userId)', 'like'
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
  parentId: number;

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

  parent: MusicCommentInfo;

  tags: MusicCommentTagDto[];

  myLike: boolean;
}
