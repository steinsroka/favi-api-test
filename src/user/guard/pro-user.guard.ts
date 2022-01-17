import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRequest } from '../../common/@types/user-request';

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
