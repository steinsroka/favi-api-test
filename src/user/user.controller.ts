import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserIdGuard } from './guard/user-id.guard';
import { ValidateUserIdPipe } from './pipe/validate-user-id.pipe';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('user/:id')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard, UserIdGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUserInfo(@Param('id') id: number): Promise<User> {
    return this.userService.getUserFromId(id);
  }

  @Delete()
  @HttpCode(204)
  deleteUserInfo(@Param('id') id: number): void {
    this.userService.deleteUserFromId(id);
  }

  @Put()
  updateUserInfo(@Request() req): Promise<User> {
    return this.userService.saveUser(req.user);
  }
}
