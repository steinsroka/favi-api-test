import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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
import { Tag, TagClass } from '../common/entity/music-tag-value.entity';
import { isDefined } from 'class-validator';
import { use } from 'passport';
import { AddAlbumDto } from './dto/add-album.dto';
import { get } from 'node:http';
import { Album } from 'src/common/entity/album.entity';

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

  @Get('liked_musics')
  async getUserLikedMusics(@Param('id') id: number, @Query('tag') tag?: Tag) {
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

  @Post('album')
  async addAlbum(
    @Param('id') userId: number,
    @Body() addAlbumDto: AddAlbumDto,
  ){
    return await this.userService.addAlbum(userId,addAlbumDto.name,addAlbumDto.isPublic);
  }

  @Get('album')
  async getAlbum(
    @Param('id') id: number
  ): Promise<Album[]>{
   return await this.userService.getAlbums(id); 
  }

}
