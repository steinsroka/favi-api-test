import { BeatCommentTagDto } from '../../beat/dto/beat-comment-tag.dto';
import { ViewEntity, ViewColumn, Connection } from 'typeorm';
import { BeatComment } from '../entity/beat-comment.entity';
// import { BeatTagValue } from '../entity/beat-tag-value.entity';
import { Beat } from '../entity/beat.entity';
import { User } from '../entity/user.entity';
// import { BeatTagInfo } from './beat-tag-info.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('MIN(beatComment.id)', 'id')
      .addSelect('MIN(beatComment.beatId)', 'beatId')
      .addSelect('MIN(beatComment.comment)', 'comment')
      .addSelect('MIN(beatComment.timestamp)', 'timestamp')
      .addSelect('MIN(beatComment.parentId)', 'parentId')
      .addSelect('MIN(user.name)', 'userName')
      .addSelect('MIN(user.id)', 'userId')
      .addSelect('COUNT(beatCommentLikes.userId)', 'like')
      .from(BeatComment, 'beatComment')
      .leftJoin('beatComment.user', 'user')
      .leftJoin('beatComment.beatCommentLikes', 'beatCommentLikes')
      .groupBy('beatComment.id'),
})
export class BeatCommentInfo {
  @ViewColumn()
  id: number;

  @ViewColumn()
  userId: number;

  @ViewColumn()
  parentId: number;

  @ViewColumn()
  beatId: number;

  @ViewColumn()
  comment: string;

  @ViewColumn()
  timestamp: Date;

  @ViewColumn()
  like: number;

  @ViewColumn()
  userName: string;

  parent: BeatCommentInfo;

  // tags: MusicCommentTagDto[];

  myLike: boolean;
}
