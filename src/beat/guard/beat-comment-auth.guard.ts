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
import { BeatService } from '../beat.service';

@Injectable()
export class BeatCommentAuthGuard implements CanActivate {
  constructor(private readonly beatService: BeatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: UserRequest = context.switchToHttp().getRequest();
    const commentId = parseInt(request.params.comment_id);
    if (!(await this.beatService.isExistBeatComment(commentId))) {
      return true;
    }
    const beatComment = await this.beatService.getBeatComment(commentId);
    if (beatComment.userId !== request.user.id) {
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
