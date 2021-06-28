import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
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
import { UserInfo } from '../common/view/user-info.entity';
import { Tag,TagClass } from '../common/entity/music-tag-value.entity';
import { isDefined } from 'class-validator';

@Controller('user/:id')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard, UserAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUser(@Param('id') id: number): Promise<UserInfo> {
    const user = await this.userService.getUserInfo(id);
    user.tags = await this.userService.getUserTags(id);
    return user;
  }

  @Get('likes')
  async getUserLikedMusics(
    @Param('id') id: number,
    @Query('class') tag?: Tag,
  ) {
    if (isDefined(tag)) {
      return await this.userService.getUserLikedTagMusic(id, tag);
    }
    return await this.userService.getUserLikedAllMusic(id);
  }

  @Delete()
  @HttpCode(204)
  async deleteUser(@Param('id') id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Patch()
  async updateUser(
    @Req() req: UserRequest,
    @Body() user: UpdateUserDto,
  ): Promise<UserPartialDto> {
    for (const key of Object.keys(user)) {
      req.user[key] = user[key];
    }
    await this.userService.saveUser(req.user);
    return await this.userService.getUserInfo(req.user.id);
  }
}
