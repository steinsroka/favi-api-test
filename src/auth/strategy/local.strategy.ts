import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../common/entity/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(email, password);
    if (user === null) {
      throw new UnauthorizedException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Bad Request',
        error: 'user email or password is different.',
      });
    }
    return user;
  }
}
