import { ViewColumn, ViewEntity } from 'typeorm';

export enum SocialLogType {
  MUSIC_COMMENT = 'music_comment',
  MUSIC_LIKE = 'music_like',
}

@ViewEntity({
  expression:
    'SELECT `userId`, `id`, `timestamp`, "music_comment" AS `type` FROM music_comment ORDER BY `timestamp` DESC'
    // 'SELECT `userId`, `id`, `timestamp`, "music_comment" AS `type` FROM music_comment UNION SELECT `userId`, `musicId` AS id, `timestamp`, "music_like" AS `type` FROM music_like ORDER BY `timestamp` DESC',
})
export class SocialLog {
  @ViewColumn()
  userId: number;

  //musicId when type is music_like, musicCommentId when type is music_comment
  @ViewColumn()
  id: number;

  @ViewColumn()
  type: SocialLogType;

  @ViewColumn()
  timestamp: Date;
}
