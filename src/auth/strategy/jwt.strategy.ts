import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthConfig } from '../../config/configInterface';
import { User } from '../../common/entity/user.entity';
import { UserService } from '../../user/user.service';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

// JWT는 정보를 JSON개체로 신뢰성 있게 전송하기 위한 모듈 (json의 토큰화)> 정보의 안전한 전달, 권한체크를 위해 사용됨
@Injectable() // injectable: JwtStrategy를 다른 곳에서도 사용가능하도록 만들어줌
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService, // 토큰이 유효한지 확인한 후 Payload의 유저이름으로 DB에서 유저객체를 가져오기위해
  ) {
    // 부모 컴포넌트를 사용하기 위해 super사용
    super({
      // 토큰 어디서 가져올거냐? : header에서 bearer라는 타입으로 가져올거임
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secret code(모듈에서와 동일한 값) > 같은지 체크할때 사용
      secretOrKey: configService.get<AuthConfig>('auth').jwtSecret,
      failureFlash: 'Invalid token',
    });
  }

  // Response Type을 Promise타임으로 지정하면 resolve시 Response에 대한 값을 동기적으로 보장받을 수 있다.
  async validate(payload: JwtPayloadDto): Promise<User> {
    // const user:User = await this.userService.getUserAuthInfo({ id: payload.userId });
    // if(!user) {
    //   throw new UnauthorizedException();
    // }
    return this.userService.getUserAuthInfo({ id: payload.userId });
  }
}

/**
 * JWT Flow
 * Admin만 볼 수 있는 글을 보고자 할 때, Admin 유저가 보고자 할 때
 * 요청을 보낼 때 보관하고 있던 Token을 Header에 넣어서 같이 보냄
 * 서버에서는 JWT를 이용해서 token을 다시 생성한 후 두개를 비교 -> 통과시 원하는 글을 볼 수 있음
 *
 * 비교과정
 * 서버에서 요청과 같이 온 headers와 payload를 가져오고 서버안에 가지고 있는 secret을 이용해 Signature 재생성
 * 둘이 일치시 통과
 */
