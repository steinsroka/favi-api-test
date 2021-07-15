import { MusicCommentInfo } from '../../common/view/music-comment-info.entity';
import { MusicInfo } from '../../common/view/music-info.entity';
import { UserInfo } from '../../common/view/user-info.entity';

export type UserSocialLog = UserSocialLogMusicComment | UserSocialLogMusicLike;

export class UserSocialLogMusicComment {
  user: UserInfo;

  music: MusicInfo;

  musicComment: MusicCommentInfo;
}

export class UserSocialLogMusicLike {
  user: UserInfo;

  music: MusicInfo;
}
