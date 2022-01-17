import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import userVerifyCode from '../../common/class/user-verify-code';

@Injectable()
export class VerifyEmailCodeGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const methodKey = context.getHandler().name;
    if (
      !userVerifyCode.verifyCode(
        request.body.email,
        methodKey,
        request.headers.authorization,
      )
    ) {
      throw new UnauthorizedException('email verification code failed');
    }
    return true;
  }
}
