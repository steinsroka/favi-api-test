import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserInfo } from '../../common/view/user-info.entity';
import { Observable } from 'rxjs';
import { UserRequest } from '../../common/@types/user-request';
import { ErrorMessage } from '../../common/class/error-message';
import { ErrorString } from '../../common/const/error-string';

@Injectable()
export class TestUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request: UserRequest = context.switchToHttp().getRequest();
    const curTime: Date = new Date();
    if (request.user.testEnd < curTime) {
      throw new ForbiddenException(
        "the validity period of the test user has expired."
      )
    }
    return true;
  }
}
