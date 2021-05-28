import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserRequest } from '../common/@types/user-request';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPartialDto } from './dto/user-partial.dto';
import { UserAuthGuard } from './guard/user-auth.guard';
import { ValidateUserIdPipe } from './pipe/validate-user-id.pipe';
import { User } from '../common/entity/user.entity';
import { UserService } from './user.service';

@Controller('user/:id')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard, UserAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUserInfo(@Param('id') id: number): Promise<UserPartialDto> {
    return this.userService.getUser({ id: id });
  }

  @Delete()
  @HttpCode(204)
  deleteUserInfo(@Param('id') id: number): void {
    this.userService.deleteUser({ id: id });
  }

  @Patch()
  async updateUserInfo(
    @Req() req: UserRequest,
    @Body() user: UpdateUserDto,
  ): Promise<UserPartialDto> {
    for (const key of Object.keys(user)) {
      req.user[key] = user[key];
    }
    await this.userService.saveUser(req.user);
    return this.userService.getUser({ id: req.user.id });
  }
}
