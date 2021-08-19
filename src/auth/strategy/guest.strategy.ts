import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { isDefined } from 'class-validator';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { UserRequest } from '../../common/@types/user-request';
import { GuestUser } from '../../common/entity/user.entity';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  async validate(request: UserRequest) {
    if (isDefined(request.headers.authorization)) {
      return false;
    }
    return new GuestUser();
  }
}
