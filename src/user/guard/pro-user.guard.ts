import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserInfo } from '../../common/view/user-info.entity';
import { Observable } from 'rxjs';
import { UserRequest } from '../../common/@types/user-request';
import { ErrorMessage } from '../../common/class/error-message';
import { ErrorString } from '../../common/const/error-string';

@Injectable()
export class ProUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: UserRequest = context.switchToHttp().getRequest();
    const curTime: Date = new Date();
    if (request.user.proEnd < curTime) {
      return false;
    }
    return true;
  }
}
