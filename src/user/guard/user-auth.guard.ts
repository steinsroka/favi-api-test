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
export class UserAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: UserRequest = context.switchToHttp().getRequest();
    for (const key of Object.keys(request.params)) {
      console.log('user-auth-key',key);

      switch (key) {
        case 'id':
          if (request.user.id.toString() !== request.params.id) {
            throw new UnauthorizedException(
                'you are not authorized to edit different user',
            );
          }
          break;
        case 'album_id':

          break;
        case 'music_id':

          break;
        default:
          throw new BadRequestException();
      }
    }
    return true;
  }
}
