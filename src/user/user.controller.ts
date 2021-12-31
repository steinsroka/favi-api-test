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
  Put,
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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { UserLikedAlbumDto } from './dto/user-liked-album.dto';
import { ValidateMuiscIdPipe } from './pipe/validate-music-id.pipe copy';

@ApiTags('User(유저) 정보 관련 API')
@ApiResponse({
  status:401,
  description: "JWT 토큰 만료, 혹은 유저가 해당 권한이 없음",
})
@ApiBearerAuth()
@Controller('user/:id')
@UsePipes(ValidateUserIdPipe)
@UseGuards(JwtAuthGuard, UserAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(forwardRef(() => MusicService))
    private readonly musicService: MusicService,
  ) {}

  @ApiOperation({summary: "유저 정보 조회"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiResponse({
    status:200,
    description: "유저 데이터 전송 성공",
    type: UserInfo
  })
  @ApiResponse({
    status:401,
    description: "JWT 토큰이 없거나 만료됨, 도는 권한이 없는 다른 사용자 데이터 요청함"
  })
  @Get()
  async getUser(@Param('id') id: number): Promise<UserInfo> {
    const user = await this.userService.getUserInfo(id);
    return user;
  }

  @ApiOperation({summary: "좋아요 한 음악 조회"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiQuery({
    name:"tag",
    description:"유저가 검색할 태그 (하나)",
    required:false,
    enum:Tag
  })
  @ApiResponse({
    status:200,
    description: "요청 성공 (Music Array 반환)",
    isArray: true,
    type:Music
  })
  @Get('liked_musics')
  async getUserLikedMusics(@Param('id') id: number, @Query('tag') tag?: Tag) {
    if (isDefined(tag)) {
      return await this.userService.getUserLikedTagMusic(id, tag);
    }
    return await this.userService.getUserLikedAllMusic(id);
  }

  @ApiOperation({summary: "좋아요 한 데이터를 기반으로 추천 앨범 조회 (TODO : 동적 쿼리 확인 필요)"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiResponse({
    status:200,
    description: "요청 성공 (Music Array 반환)",
    isArray: true,
    type:UserLikedAlbumDto
  })
  @Get('liked_albums')
  async getUserLikedAlbums(@Param('id') id: number) {
    return await this.userService.getUserLikedAlbums(id);
  }

  @ApiOperation({summary: "유저 삭제"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiResponse({
    status:204,
    description: "유저 데이터 삭제 성공",
  })
  @ApiResponse({
    status:401,
    description: "JWT 토큰 만료, 혹은 권한이 없는 유저 삭제 요청함",
  })
  @Delete()
  @HttpCode(204)
  async deleteUser(@Param('id') id: number): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @ApiOperation({summary: "유저 데이터 변경"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiBody({
    description:"age : [ 10,20,30,40,50 ], gender : [ men, women, default ] 중 선택, name : 사용자 이름. 입력되지 않은 Field는 무시됩니다.",
    type:PickType(User, ['age', 'gender', 'name'])
  })
  @ApiResponse({
    status:200,
    description: "유저 데이터 변경 성공 (변경된 User Data 반환)",
    type:UserInfo
  })
  @ApiResponse({
    status:400,
    description: "입력된 Field가 유효하지 않음.",
  })
  @ApiResponse({
    status:401,
    description: "JWT 토큰 만료, 혹은 권한이 없는 유저 삭제 요청함",
  })
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

  @ApiOperation({summary: "테스터 API - 음악 정보 배열 조회"})
  @ApiParam({
    name:"id",
    description:"테스터 유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiQuery({
    name:'index',
    description:"쿼리 인덱스",
    example: 0,
  })
  @ApiQuery({
    name:"size",
    description:"쿼리 사이즈",
    example:5,
  })
  @ApiResponse({
    status:200,
    description: "API 요청 성공 (음악 Array 반환)",
    isArray: true,
    type:Music
  })
  @ApiResponse({
    status:403,
    description: "테스터의 테스트 기간이 만료되었거나, 유저가 테스터가 아님",
  })
  @Get('tester')
  @UseGuards(TestUserGuard)
  async getTesterMusics(
    @Req() req: UserRequest,
    @Query('index') index: number,
    @Query('size') size: number,
  ): Promise<Music[]> {
    return await this.userService.getTesterMusics(req.user, index, size);
  }

  @ApiOperation({summary: "테스터 API - 진행 상황 조회"})
  @ApiParam({
    name:"id",
    description:"테스터 유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiResponse({
    status:200,
    description: "API 요청 성공 (전체 개수와 남은 개수 반환))",
    isArray: true,
    type:TesterProceedDto
  })
  @ApiResponse({
    status:403,
    description: "테스터의 테스트 기간이 만료되었거나, 유저가 테스터가 아님",
  })
  @Get('tester/proceed')
  @UseGuards(TestUserGuard)
  async getTesterProceedCount(
    @Req() req: UserRequest,
  ): Promise<TesterProceedDto> {
    return await this.userService.getTesterMusicCount(req.user);
  }

  @ApiOperation({summary: "사용자 앨범 생성"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiResponse({
    status:201,
    description: "API 요청 성공 (생성된 앨범 반환)",
    type:Album
  })
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

  @ApiOperation({summary: "사용자 앨범 전체 조회"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiResponse({
    status:200,
    description: "API 요청 성공 (해당 사용자의 모든 앨범 반환)",
    type:Album
  })
  @Get('album')
  async getAlbum(@Param('id') id: number): Promise<Album[]> {
    return await this.userService.getAlbums(id);
  }

  @ApiOperation({summary: "해당 앨범에 들어있는 음악 조회"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiParam({
    name:"album_id",
    description:"앨범 ID",
    example: "37"
  })
  @ApiResponse({
    status:200,
    description: "API 요청 성공 (음악 배열 반환)",
    isArray:true,
    type: Music
    })
  @ApiResponse({
    status:404,
    description: "앨범 ID가 유효하지 않음"
  })
  @Get('album/:album_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  async getMusicInAlbum(
    @Param('id') id: number,
    @Param('album_id') albumId: number,
  ): Promise<Music[]> {
    return await this.userService.getMusicsInAlbum(id, albumId);
  }

  @ApiOperation({summary: "사용자 앨범에 곡 추가"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiParam({
    name:"album_id",
    description:"앨범 ID",
    example: "37"
  })
  @ApiParam({
    name:"music_id",
    description:"음악 ID",
    example: "560"
  })
  @ApiResponse({
    status:201,
    description: "API 요청 성공 (노래가 추가된 해당 앨범 반환) 노래가 중복되어 보일 수 있지만, 실제로 DB에서는 중복 값은 무시하고 저장됨.",
    type:Album
  })
  @ApiResponse({
    status:404,
    description: "앨범 ID 혹은 음악 ID가 유효하지 않음"
  })
  @Post('album/:album_id/:music_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UsePipes(ValidateMuiscIdPipe)
  @UseGuards(AlbumOwnerGuard)
  async addMusicInAlbum(
    @Param('id') id : number,
    @Param('album_id') albumId: number,
    @Param('music_id') musicId: number,
  ) {
    return await this.userService.addMusicInAlbum(albumId, musicId);
  }

  @ApiOperation({summary: "사용자 앨범 이름 / 공개여부 변경"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiParam({
    name:"album_id",
    description:"앨범 ID",
    example: "37"
  })
  @ApiBody({
    type:AddAlbumDto
  })
  @ApiResponse({
    status:200,
    description: "API 요청 성공 (변경된 앨범 반환)",
    type:Album
    })
  @ApiResponse({
    status:404,
    description: "앨범 ID가 유효하지 않음"
  })
  @Patch('album/:album_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  async updateAlbum(
    @Param('id') id : number,
    @Param('album_id') albumId: number,
    @Body() updateAlbumDto: AddAlbumDto,
  ) {
    return await this.userService.updateAlbum(
      albumId,
      updateAlbumDto.name,
      updateAlbumDto.isPublic,
    );
  }

  @ApiOperation({summary: "앨범 삭제"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiParam({
    name:"album_id",
    description:"앨범 ID",
    example: "38"
  })
  @ApiResponse({
    status:204,
    description: "API 요청 성공"
    })
  @ApiResponse({
    status:404,
    description: "앨범 ID가 유효하지 않음"
  })
  @Delete('album/:album_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UseGuards(AlbumOwnerGuard)
  @HttpCode(204)
  async deleteAlbum(
    @Param('id') id : number,
    @Param('album_id') albumId: number): Promise<void> {
    await this.userService.deleteAlbum(albumId);
  }

  @ApiOperation({summary: "해당 앨범의 노래 삭제"})
  @ApiParam({
    name:"id",
    description:"유저 ID, JWT Token Decode시 본인의 ID 얻을 수 있음.",
    example: "433"
  })
  @ApiParam({
    name:"album_id",
    description:"앨범 ID",
    example: "37"
  })
  @ApiParam({
    name:"music_id",
    description:"음악 ID",
    example: "560"
  })
  @ApiResponse({
    status:204,
    description: "API 요청 성공"
    })
  @ApiResponse({
    status:404,
    description: "앨범 ID 혹은 음악 ID가 유효하지 않음"
  })
  @Delete('album/:album_id/:music_id')
  @UsePipes(ValidateAlbumIdPipe)
  @UsePipes(ValidateMuiscIdPipe)
  @UseGuards(AlbumOwnerGuard)
  @HttpCode(204)
  async deleteMusicInAlbum(
    @Param('id') id:number,
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
    const now = Date.now();
    const users: number[] = isDefined(userId)
      ? [userId]
      : await this.userService.getNearUsers(id);
    // console.log('social-delay-log-1',Date.now() - now);
    const socialLogs = await this.userService.getSocialLogs(users, index);
    // console.log('social-delay-log-2',Date.now() - now);
    const result: UserSocialLog[] = [];
    const userInfos: UserInfo[] = [];
    for (const userId2 of users) {
      userInfos.push(await this.userService.getUserInfo(userId2));
    }
     // const promises = socialLogs.map( async log =>{
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
     // console.log('social-delay-log-3',Date.now() - now);
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
          // console.log('social-delay-log-4',Date.now() - now);
          musicCommentLog.music = await this.musicService.getMusic2(
            musicCommentLog.musicComment.musicId,
            req.user,
          );
          // console.log('social-delay-log-5',Date.now() - now);
          musicCommentLog.timestamp = log.timestamp;
          result.push(musicCommentLog);
          break;

      }
    }
    // console.log('social-delay-log-6',Date.now() - now);
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

  @Get('social2')
  async getUserSocialLogs2(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Query('index') index?: number,
    @Query('user_id') userId?: number,
  ) {
    const now = Date.now();
    const users: number[] = isDefined(userId)
      ? [userId]
      : await this.userService.getUserAllFollower(id);
    // console.log('social-delay-log-1',Date.now() - now);
    const socialLogs = await this.userService.getSocialLogs(users, index);
    // console.log('social-delay-log-2',Date.now() - now);
    const result: UserSocialLog[] = [];
    const userInfos: UserInfo[] = [];
    for (const userId2 of users) {
      userInfos.push(await this.userService.getUserInfo(userId2));
    }
     // const promises = socialLogs.map( async log =>{
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
     // console.log('social-delay-log-3',Date.now() - now);
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
          // console.log('social-delay-log-4',Date.now() - now);
          musicCommentLog.music = await this.musicService.getMusic2(
            musicCommentLog.musicComment.musicId,
            req.user,
          );
          // console.log('social-delay-log-5',Date.now() - now);
          musicCommentLog.timestamp = log.timestamp;
          result.push(musicCommentLog);
          break;

      }
    }
    // console.log('social-delay-log-6',Date.now() - now);
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

  @Put(':id/follow')
  @HttpCode(204)
  async userFollow(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.userService.addUserFollow(id, req.user);
  }

  @Delete(':id/follow')
  @HttpCode(204)
  async hateFollow(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.userService.deleteUserFollow(id, req.user);
  }


}
