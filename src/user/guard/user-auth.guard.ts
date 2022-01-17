import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRequest } from '../../common/@types/user-request';

@Injectable()
export class UserAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: UserRequest = context.switchToHttp().getRequest();
    for (const key of Object.keys(request.params)) {
      switch (key) {
        case 'user_id':
          console.log(request.user.id.toString());
          console.log(request.params.user_id);
          if (request.user.id.toString() !== request.params.user_id) {
            throw new UnauthorizedException(
              'you are not authorized to edit different user',
            );
          }
          break;
      }
    }
    return true;
  }
}
