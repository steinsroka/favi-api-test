//nest js decorater
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

//nest?
import { UserRequest } from '../common/@types/user-request';
import { isDefined } from 'class-validator';
import { use } from 'passport';
import { get } from 'node:http';

//Pipe
import { ValidateUserIdPipe } from './pipe/validate-user-id.pipe';
import { ValidateAlbumIdPipe } from './pipe/validate-album-id.pipe';
import { ValidateMusicPipe } from '../music/pipe/validate-music.pipe';

//Guard
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserAuthGuard } from './guard/user-auth.guard';
import { AlbumOwnerGuard } from './guard/album-owner.guard';

//Dto
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPartialDto } from './dto/user-partial.dto';
import { AddAlbumDto } from './dto/add-album.dto';

//Entity
import { UserInfo } from '../common/view/user-info.entity';
import { Tag, TagClass } from '../common/entity/music-tag-value.entity';
import { User } from '../common/entity/user.entity';
import { Album } from '../common/entity/album.entity';
import { Music } from '../common/entity/music.entity';

//Service
import { UserService } from './user.service';
import { from } from 'rxjs';

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

  @Get('liked_albums')
  async getUserLikedAlbums(@Param('id') id: number) {}

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
  ) {
    return await this.userService.addAlbum(
      userId,
      addAlbumDto.name,
      addAlbumDto.isPublic,
    );
  }

  @Get('album')
  async getAlbum(@Param('id') id: number): Promise<Album[]> {
    return await this.userService.getAlbums(id);
  }

  @Get('album/:album_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  async getMusicInAlbum(
    @Param('id') id: number,
    @Param('album_id') albumId: number,
  ): Promise<Music[]> {
    return await this.userService.getMusicsInAlbum(id, albumId);
  }

  @Post('album/:album_id/:music_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  async addMusicInAlbum(
    @Param('album_id') albumId: number,
    @Param('music_id') musicId: number,
  ) {
    return await this.userService.addMusicInAlbum(albumId, musicId);
  }

  @Patch('album/:album_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  async updateAlbum(
    @Param('album_id') albumId: number,
    @Body() updateAlbumDto: AddAlbumDto,
  ) {
    return await this.userService.updateAlbum(
      albumId,
      updateAlbumDto.name,
      updateAlbumDto.isPublic,
    );
  }

  @Delete('album/:album_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  @HttpCode(204)
  async deleteAlbum(@Param('album_id') albumId: number): Promise<void> {
    await this.userService.deleteAlbum(albumId);
  }

  @Delete('album/:album_id/:music_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  @HttpCode(204)
  async deleteMusicInAlbum(
    @Param('album_id') albumId: number,
    @Param('music_id') musicId: number,
  ): Promise<void> {
    await this.userService.deleteMusicInAlbum(albumId, musicId);
  }
}
