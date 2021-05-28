import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../../config/configInterface';
import { User } from '../../common/entity/user.entity';
import { UserService } from '../../user/user.service';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<AuthConfig>('auth').jwtSecret,
    });
  }

  async validate(payload: JwtPayloadDto): Promise<User> {
    return this.userService.getUserAllInfo({ id: payload.userId });
  }
}
