import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
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
import { Message } from '../common/class/message';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { TestUserGuard } from '../user/guard/test-user.guard';
import { UserRequest } from '../common/@types/user-request';
import { MusicService } from './music.service';
import { MusicInfo } from '../common/view/music-info.entity';
import { Artist } from '../common/entity/artist.entity';
import { AddMusicCommentDto } from './dto/add-music-comment.dto';
import { MusicComment } from '../common/entity/music-comment.entity';
import { EditMusicCommentDto } from './dto/edit-music-comment.dto';
import { VoteMusicTagDto } from './dto/vote-music-tag.dto';
import { Tag } from '../common/entity/music-tag-value.entity';
import { DeleteResult, InsertResult } from 'typeorm';
import { MusicCommentInfo } from '../common/view/music-comment-info.entity';
import { MusicCommentAuthGuard } from './guard/music-comment-auth.guard';
import { ValidateMusicPipe } from './pipe/validate-music.pipe';
import { EditMusicDto } from './dto/edit-music.dto';
import { isDefined } from 'class-validator';
import { ErrorMessage } from '../common/class/error-message';
import { ErrorString } from '../common/const/error-string';
import { UserService } from '../user/user.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { Music } from '../common/entity/music.entity';
import { MusicTagInfo } from 'src/common/view/music-tag-info.entity';

@ApiTags('Music(음악) 관련 API')
@ApiBearerAuth()
@ApiResponse({
  status:401,
  description: "JWT 토큰 만료, 혹은 유저가 해당 권한이 없음",
})
@Controller('music')
@UseGuards(JwtAuthGuard)
@UsePipes(ValidateMusicPipe)
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @ApiOperation({summary: "음악 정보 조회"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "650"
  })
  @ApiResponse({
    status:200,
    description: "조회 성공(음악 데이터 반환)",
    type:MusicInfo
  })
  @Get(':id')
  async getMusicInfo(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<MusicInfo> {
    const music = await this.musicService.getMusic(id, req.user);
    return music;
  }

  @ApiOperation({summary: "특정 아티스트의 음악 조회"})
  @ApiParam({
    name:"id",
    description:"아티스트 ID",
    example: "7"
  })
  @ApiResponse({
    status:200,
    description: "조회 성공(아티스트와 해당 아티스트의 음악 데이터 반환)",
    type:Artist
  })
  @Get('artist/:id')
  async getMusicWithArtist(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<Artist> {
    const music = await this.musicService.getMusicWithArtist(id, req.user);
    return music;
  }

  @ApiOperation({summary: "테스터 API - 곡 수정"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "650"
  })
  @ApiBody({
    description:"수정할 Field를 보내면 해당 Field가 수정됩니다. 입력되지 않은 Field는 무시됩니다.",
    type:PickType(Music, [
      'link',
      'bpm',
      'melodyScale',
      'language',
      'vocalType',
      'copyright',
      'rhythmBeat',
    ])
  })
  @ApiResponse({
    status:200,
    description: "수정 성공(아티스트와 해당 아티스트의 음악 데이터 반환)",
    type:Artist
  })
  @Patch(':id')
  @UseGuards(TestUserGuard)
  async editMusic(
    @Req() req: UserRequest,
    @Param('id') id: number,
    @Body() editMusicDto: EditMusicDto,
  ) {
    if (!(await this.userService.isExistTesterMusic(req.user, id))) {
      throw new ForbiddenException();
    }
    const result = await this.musicService.editMusic(id, editMusicDto);
    await this.userService.deleteTesterMusic(req.user, id);
    return result;
  }

  @ApiOperation({summary: "음악에 유저의 좋아요 추가"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "650"
  })
  @Put(':id/like')
  @HttpCode(204)
  async likeMusic(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.musicService.addMusicLike(id, req.user);
  }


  @ApiOperation({summary: "음악에 유저의 좋아요 삭제"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "650"
  })
  @ApiResponse({
    status:204,
    description: "삭제 성공",
  })
  @Delete(':id/like')
  @HttpCode(204)
  async hateMusic(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.musicService.deleteMusicLike(id, req.user);
  }

  @ApiOperation({summary: "해당 음악 댓글 조회 (10개 단위, 최신순)"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiQuery({
    name:"index",
    description:"조회할 index, 비울 시 기본값 : 0 (처음부터 검색), 만약 2라면 20~30번째 댓글 가져옴. 0번이 가장 최신 댓글",
    required: false,
  })
  @ApiResponse({
    status:200,
    description: "조회 성공 (10개 단위로 반환)",
    isArray: true,
    type:MusicCommentInfo,
  })
  @Get(':id/comment')
  async getMusicComments(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Query('index') index?: number,
  ): Promise<MusicCommentInfo[]> {
    const musicComments = await this.musicService.getMusicComments(
      id,
      index,
      req.user,
    );
    return musicComments;
  }

  @ApiOperation({summary: "해당 음악에 댓글 작성"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiBody({
    type:AddMusicCommentDto,
  })
  @ApiResponse({
    status:201,
    description: "생성 성공",
    type:Message,
  })
  @ApiResponse({
    status:404,
    description: "(대댓글 작성 시) 해당 댓글이 서버에 존재하지 않음",
  })
  @Post(':id/comment')
  async addMusicComment(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Body() addMusicCommentDto: AddMusicCommentDto,
  ): Promise<Message> {

    // parent 필드가 있을 시 (대댓글일시), 해당 댓글이 서버에 있는지 확인
    if (
      isDefined(addMusicCommentDto.parent) &&
      !(await this.musicService.isExistMusicComment(addMusicCommentDto.parent))
    ) {
      throw new NotFoundException(
          `music comment id ${addMusicCommentDto.parent} is not exist`
      );
    }

    // 댓글 추가
    const comment = await this.musicService.addMusicComment(
      id,
      req.user,
      addMusicCommentDto.comment,
      addMusicCommentDto.parent,
    );

    // Tag는 Promise로 async하게 insert
    const addMusicPromise:
      | Promise<InsertResult>[]
      | undefined = addMusicCommentDto.tags?.map((value: Tag) =>
      this.musicService.addMusicTag(id, value, req.user, comment.id),
    );
    await Promise.all(addMusicPromise ?? []);

    return new Message('success');
  }


  @ApiOperation({summary: "댓글 삭제"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiParam({
    name:"comment_id",
    description:"댓글 ID",
    example: "955"
  })
  @ApiResponse({
    status:204,
    description: "댓글 삭제 성공",
  })
  @ApiResponse({
    status:401,
    description: "JWT 토큰 만료, 혹은 유저가 해당 권한이 없음. 또는 유저가 해당 댓글을 지울 권한이 없음.",
  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id, comment id가 유효하지 않음 (서버에 해당 댓글이 없음)",
  })
  @UseGuards(MusicCommentAuthGuard)
  @Delete(':id/comment/:comment_id')
  @HttpCode(204)
  async deleteMusicComment(
    @Param('id') id: number,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    const result = await this.musicService.deleteMusicComment(id, commentId);
    if(result.affected === 0){
      throw new NotFoundException("Music id or comment id is not valid");
    }
  }

  @ApiOperation({summary: "댓글 수정"})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiParam({
    name:"comment_id",
    description:"댓글 ID",
    example: "955"
  })
  @ApiResponse({
    status:204,
    description: "댓글 수정 성공 (수정된 댓글 객체 반환)",
  })
  @ApiResponse({
    status:401,
    description: "JWT 토큰 만료, 혹은 유저가 해당 권한이 없음. 또는 유저가 해당 댓글을 수정할 권한이 없음.",
  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id, comment id가 유효하지 않음 (서버에 해당 댓글이 없음)",
  })
  @UseGuards(MusicCommentAuthGuard)
  @Patch(':id/comment/:comment_id')
  async editMusicComment(
    @Param('id') id: number,
    @Param('comment_id') commentId: number,
    @Body() editMusicCommentDto: EditMusicCommentDto,
  ): Promise<MusicComment> {
    return await this.musicService.updateMusicComment(
      id,
      commentId,
      editMusicCommentDto.newComment,
    );
  }


  @ApiOperation({summary: "댓글에 좋아요 추가" })
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiParam({
    name:"comment_id",
    description:"댓글 ID",
    example: "955"
  })
  @ApiResponse({
    status:204,
    description: "댓글 좋아요 성공",
  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id, comment id가 유효하지 않음 (서버에 해당 댓글이 없음)",
  })
  @Put(':id/comment/:comment_id/like')
  @HttpCode(204)
  async likeMusicComment(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.musicService.addMusicCommentLike(id, commentId, req.user);
  }

  @ApiOperation({summary: "댓글에 좋아요 삭제" })
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiParam({
    name:"comment_id",
    description:"댓글 ID",
    example: "955"
  })
  @ApiResponse({
    status:204,
    description: "댓글 좋아요 삭제 성공",
  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id, comment id가 유효하지 않음 (서버에 해당 댓글이 없음)",
  })
  @Delete(':id/comment/:comment_id/like')
  @HttpCode(204)
  async hateMusicComment(
    @Request() req: UserRequest,
    @Param('id') id : number,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    const result = await this.musicService.deleteMusicCommentLike(commentId, req.user);
    if(result.affected === 0){
      throw new NotFoundException("Music id or comment id is not valid");
    }
  }

  @ApiOperation({summary: "음악 태그 조회" })
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id가 유효하지 않음",
  })
  @Get(':id/tag')
  async getMusicTag(@Param('id') id: number) : Promise<MusicTagInfo[]> {
    return await this.musicService.getMusicTags(id);
  }

  @ApiOperation({summary: "음악 태그 추가" })
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiBody({
    type : VoteMusicTagDto,
  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id가 유효하지 않음",
  })
  @Put(':id/tag')
  async voteMusicTag(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Body() voteMusicTagDto: VoteMusicTagDto,
  ) {
    await this.musicService.addMusicTag(id, voteMusicTagDto.tag, req.user);
    return new Message('success');
  }

  @ApiOperation({summary: "해당하는 노래를 좋아하는 사람 조회", description : ` 200 Response 예시입니다 : [
    {
       "type": "age",
       "result": {
         "10": 50.0,
         "20": 50.0,
         "30": 0.0,
         "40": 0.0,
         "50": 0.0,
        }
    },
    {
       "type": "gender",
       "result": {
         "men": 40.0,
         "women": 20.0,
         "other": 40.0
       }
    }
  ]`})
  @ApiParam({
    name:"id",
    description:"음악 ID",
    example: "252"
  })
  @ApiResponse({
    status:200,
    description: "조회 성공",

  })
  @ApiResponse({
    status:404,
    description: "해당 음악 id가 유효하지 않음",
  })
  @Get(':id/users')
  async getUserDistribution(@Param('id') id: number) {
    return await this.musicService.getUserDistributionInMusic(id);
  }
}
