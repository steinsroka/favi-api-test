import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UserIdCheckMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const countUserId = await this.userRepository.count({
      where: { id: req.params.id },
    });
    if (countUserId === 0) {
      throw new NotFoundException({
        message: `user id ${req.params.id} is not exist in userDB`,
      });
    }
    next();
  }
}
