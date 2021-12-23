import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { isDefined } from 'class-validator';
import { Observable } from 'rxjs';
import { UserRequest } from '../../common/@types/user-request';
import { ErrorMessage } from '../../common/class/error-message';
import { ErrorString } from '../../common/const/error-string';
import { MusicService } from '../music.service';

@Injectable()
export class MusicCommentAuthGuard implements CanActivate {
  constructor(private readonly musicService: MusicService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: UserRequest = context.switchToHttp().getRequest();
    const commentId = parseInt(request.params.comment_id);
    if (!(await this.musicService.isExistMusicComment(commentId))) {
      return true;
    }
    const musicComment = await this.musicService.getMusicComment(commentId);
    if (musicComment.userId !== request.user.id) {
      throw new UnauthorizedException(
        new ErrorMessage(
          `user id ${request.user.id} not has beat comment id ${request.params.comment_id}`,
          ErrorString.FAIL_NOT_AUTHORIZED,
        ),
      );
    }
    return true;
  }
}
