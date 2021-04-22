import { Controller, Get, Param, Post } from '@nestjs/common';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user/:id')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  async getUserInfo(@Param('id') id: number): Promise<User> {
    return this.userService.getUserFromId(id);
  }
}
