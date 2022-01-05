import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRequest } from '../../common/@types/user-request';

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
