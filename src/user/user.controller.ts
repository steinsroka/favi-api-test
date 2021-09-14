//nest js decorater
import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Request,
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
import { MusicService } from '../music/music.service';
import {
  UserSocialLog,
  UserSocialLogMusicComment,
  // UserSocialLogMusicLike,
} from './dto/user-social-log.dto';
import { TestUserGuard } from './guard/test-user.guard';
import { TesterProceedDto } from './dto/tester-remain.dto';

@Controller('user/:id')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard, UserAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => MusicService))
    private readonly musicService: MusicService,
  ) {}

  @Get()
  async getUser(@Param('id') id: number): Promise<UserInfo> {
    const user = await this.userService.getUserInfo(id);
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
  async getUserLikedAlbums(@Param('id') id: number) {
    return await this.userService.getUserLikedAlbums(id);
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

  @Get('tester')
  @UseGuards(TestUserGuard)
  async getTesterMusics(
    @Req() req: UserRequest,
    @Query('index') index: number = 0,
    @Query('size') size: number = 5,
  ): Promise<Music[]> {
    return await this.userService.getTesterMusics(req.user, index, size);
  }

  @Get('tester/proceed')
  @UseGuards(TestUserGuard)
  async getTesterProceedCount(
    @Req() req: UserRequest,
  ): Promise<TesterProceedDto> {
    return await this.userService.getTesterMusicCount(req.user);
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

  @Get('social')
  async getUserSocialLogs(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Query('index') index?: number,
    @Query('user_id') userId?: number,
  ) {
    const users: number[] = isDefined(userId)
      ? [userId]
      : await this.userService.getNearUsers(id);
    // const now = Date.now();
    const socialLogs = await this.userService.getSocialLogs(users, index);
    const result: UserSocialLog[] = [];
    const userInfos: UserInfo[] = [];
    for (const userId2 of users) {
      userInfos.push(await this.userService.getUserInfo(userId2));
    }
     // const promises = await socialLogs.map( async log =>{
     //   const user = userInfos.find((value) => value.id === log.userId);
     //   // const user = await this.userService.getUserInfo(log.userId);
     //   switch (log.type) {
     //     case 'music_comment':
     //       const musicCommentLog = new UserSocialLogMusicComment();
     //       musicCommentLog.user = user;
     //       // musicCommentLog.user = await this.userService.getUserInfo(log.userId);
     //       musicCommentLog.musicComment = await this.musicService.getMusicComment(
     //         log.id,
     //         req.user,
     //       );
     //       musicCommentLog.music = await this.musicService.getMusic(
     //         musicCommentLog.musicComment.musicId,
     //         req.user,
     //       );
     //       musicCommentLog.timestamp = log.timestamp;
     //       result.push(musicCommentLog);
     //       break;
     //
     //   }
     // });
     //  await Promise.all(promises);

     for (const log of socialLogs) {
      const user = userInfos.find((value) => value.id === log.userId);

      // const user = await this.userService.getUserInfo(log.userId)
      switch (log.type) {
        case 'music_comment':
          const musicCommentLog = new UserSocialLogMusicComment();
          musicCommentLog.user = user;
          // musicCommentLog.user = await this.userService.getUserInfo(log.userId);
          musicCommentLog.musicComment = await this.musicService.getMusicComment(
            log.id,
            req.user,
          );
          musicCommentLog.music = await this.musicService.getMusic(
            musicCommentLog.musicComment.musicId,
            req.user,
          );
          musicCommentLog.timestamp = log.timestamp;
          result.push(musicCommentLog);


          break;

      }
    }
    console.log('social-delay-log',Date.now() - now);
    return { users: userInfos, result: result };


    // case 'music_like':
    //   const musicLikeLog = new UserSocialLogMusicLike();
    //   musicLikeLog.user = user;
    //   musicLikeLog.music = await this.musicService.getMusic(
    //     log.id,
    //     req.user,
    //   );
    //   musicLikeLog.timestamp = log.timestamp;
    //   result.push(musicLikeLog);
    //   break;

    // return { result: result };
  }
}
