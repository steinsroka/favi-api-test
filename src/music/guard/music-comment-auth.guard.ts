import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRequest } from '../../common/@types/user-request';
import { ErrorMessage } from '../../common/class/error-message';
import { ErrorString } from '../../common/const/error-string';
import { MusicService } from '../music.service';

@Injectable()
export class MusicCommentAuthGuard implements CanActivate {
  constructor(private readonly musicService: MusicService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request: UserRequest = context.switchToHttp().getRequest();
    const musicComment = await this.musicService.getMusicComment(parseInt(request.params.comment_id));
    if(musicComment.userId !== request.user.id) {
      throw new NotFoundException(
        new ErrorMessage(
          `music id ${request.params.id} not has music comment id ${request.params.comment_id}`,
          ErrorString.FAIL_EXIST
        )
      );
    }
    return true;
  }
}
