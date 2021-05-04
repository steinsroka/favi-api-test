import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from '../user.entity';

@Injectable()
export class UserIdGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (user.id.toString() !== request.params.id) {
      throw new UnauthorizedException({
        status: HttpStatus.UNAUTHORIZED,
        error: 'not authorized to use this user information.',
      });
    }
    return user.id.toString() === request.params.id;
  }
}
