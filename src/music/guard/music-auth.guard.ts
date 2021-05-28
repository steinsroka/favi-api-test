import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRequest } from '../../common/@types/user-request';
import { ErrorMessage } from '../../common/class/error-message';
import { ErrorString } from '../../common/const/error-string';

@Injectable()
export class MusicAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: UserRequest = context.switchToHttp().getRequest();
    for (const key of Object.keys(request.params)) {
      switch (key) {
        case 'comment_id':
          //TODO: need implementation
          break;
        default:
          throw new BadRequestException();
      }
    }
    return true;
  }
}
