import { Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ValidateUserIdPipe } from './pipe/validate-user-id.pipe';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user/:id')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  async getUserInfo(@Param('id') id: number): Promise<User> {
    return this.userService.getUserFromId(id);
  }
}
