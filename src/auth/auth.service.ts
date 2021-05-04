import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { AuthConfig } from 'src/config/configInterface';
import { User } from 'src/user/user.entity';
import { UserService } from '../user/user.service';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.hashIter = configService.get<AuthConfig>('auth').hashIter;
  }

  private readonly hashIter: number;

  async saltHash(password: string, salt: string): Promise<string> {
    let key = salt + password;
    for (let i = 0; i < this.hashIter; ++i) {
      key = createHash('sha512').update(password).digest('base64');
    }
    return key;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.getUserFromEmail(email);
    if (
      user === undefined ||
      (await this.saltHash(password, user.pw_salt)) !== user.password
    ) {
      return null;
    }
    return user;
  }

  async login(user: User) {
    const payload: JwtPayloadDto = { userId: user.id };
    return {
      message: 'success',
      token: this.jwtService.sign(payload),
    };
  }
}
