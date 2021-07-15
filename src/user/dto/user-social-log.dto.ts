import { SocialLogType } from '../../common/view/social-log.entity';
import { MusicCommentInfo } from '../../common/view/music-comment-info.entity';
import { MusicInfo } from '../../common/view/music-info.entity';
import { UserInfo } from '../../common/view/user-info.entity';

export type UserSocialLog = UserSocialLogMusicComment | UserSocialLogMusicLike;

export class UserSocialLogMusicComment {
  user: UserInfo;

  music: MusicInfo;

  musicComment: MusicCommentInfo;

  timestamp: Date;

  type: SocialLogType = SocialLogType.MUSIC_COMMENT;
}

export class UserSocialLogMusicLike {
  user: UserInfo;

  music: MusicInfo;

  timestamp: Date;

  type: SocialLogType = SocialLogType.MUSIC_LIKE;
}
