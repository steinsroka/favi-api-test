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
import { UserRequest } from '../common/@types/user-request';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { TestUserGuard } from '../user/guard/test-user.guard';
import { GuestableAuthGuard } from '../auth/guard/guestable-auth.guard';
import { Beat } from '../common/entity/beat.entity';
import { ValidateBeatPipe } from './pipe/validate-beat.pipe';
import { BeatInfo } from '../common/view/beat-info.entity';
// import { GetHelpDto } from './dto/get-help.dto';
// import { WriteHelpDto } from './dto/write-help.dto';
import { AddBeatDto } from './dto/add-beat.dto';
import { BeatComment } from '../common/entity/beat-comment.entity';
import { EditBeatCommentDto } from './dto/edit-beat-comment.dto';
import { VoteBeatTagDto } from './dto/vote-beat-tag.dto';
import { Tag } from '../common/entity/beat-tag-value.entity';
import { BeatCommentInfo } from '../common/view/beat-comment-info.entity';
import { BeatCommentAuthGuard } from './guard/beat-comment-auth.guard';
// import { ValidateBeatPipe } from './pipe/validate-beat.pipe';

import { AddBeatCommentDto } from './dto/add-beat-comment.dto';
import { BeatSmallInfoDto } from './dto/beat-small-info.dto';
import { EditBeatDto } from './dto/edit-beat.dto';
import { BeatService } from './beat.service';
import { InsertResult } from 'typeorm';
import { isDefined } from 'class-validator';
import { ErrorMessage } from '../common/class/error-message';
import { ErrorString } from '../common/const/error-string';
import { UserService } from '../user/user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Beat')
@ApiBearerAuth()
@Controller('beat')
@UseGuards(JwtAuthGuard)
@UsePipes(ValidateBeatPipe)
export class BeatController {
  constructor(
    private readonly beatService: BeatService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Post()
  async addBeat(
    @Request() req: UserRequest,
    @Body() addBeatDto: AddBeatDto,
  ): Promise<Message> {
    await this.beatService.addBeat(req.user, addBeatDto);

    return new Message('success');
  }

  @Get(':id')
  async getBeatInfo(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<BeatInfo> {
    const beat = await this.beatService.getBeat(id, req.user);
    return beat;
  }

  @Patch(':id')
  @UseGuards(TestUserGuard)
  async editBeat(
    @Req() req: UserRequest,
    @Param('id') id: number,
    @Body() editBeatDto: EditBeatDto,
  ) {
    // if (!(await this.userService.isExistTesterMusic(req.user, id))) {
    //   throw new ForbiddenException();
    // }
    const result = await this.beatService.editBeat(id, editBeatDto);
    // await this.userService.deleteTesterMusic(req.user, id);
    return result;
  }

  @Put(':id/like')
  @HttpCode(204)
  async likeBeat(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.beatService.addBeatLike(id, req.user);
  }

  @Delete(':id/like')
  @HttpCode(204)
  async hateBeat(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.beatService.deleteBeatLike(id, req.user);
  }

  @Get(':id/comment')
  async getBeatComments(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Query('index') index?: number,
  ): Promise<BeatCommentInfo[]> {
    const beatComments = await this.beatService.getBeatComments(
      id,
      index,
      req.user,
    );
    return beatComments;
  }

  @Post(':id/comment')
  async addBeatComment(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Body() addBeatCommentDto: AddBeatCommentDto,
  ): Promise<Message> {
    if (
      isDefined(addBeatCommentDto.parent) &&
      !(await this.beatService.isExistBeatComment(addBeatCommentDto.parent))
    ) {
      throw new NotFoundException(
        new ErrorMessage(
          `beat comment id ${addBeatCommentDto.parent} is not exist`,
          ErrorString.FAIL_EXIST,
        ),
      );
    }
    const comment = await this.beatService.addBeatComment(
      id,
      req.user,
      addBeatCommentDto.comment,
      addBeatCommentDto.parent,
    );
    // const addBeatPromise:
    //   | Promise<InsertResult>[]
    //   | undefined = addMusicCommentDto.tags?.map((value: Tag) =>
    //   this.musicService.addMusicTag(id, value, req.user, comment.id),
    // );
    // await Promise.all(addMusicPromise ?? []);
    return new Message('success');
  }

  @UseGuards(BeatCommentAuthGuard)
  @Delete(':id/comment/:comment_id')
  @HttpCode(204)
  async deleteBeatComment(
    @Param('id') id: number,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.beatService.deleteBeatComment(commentId);
  }

  @UseGuards(BeatCommentAuthGuard)
  @Patch(':id/comment/:comment_id')
  async editBeatComment(
    @Param('comment_id') commentId: number,
    @Body() editBeatCommentDto: EditBeatCommentDto,
  ): Promise<BeatComment> {
    return await this.beatService.updateBeatComment(
      commentId,
      editBeatCommentDto.newComment,
    );
  }

  @Put(':id/comment/:comment_id/like')
  @HttpCode(204)
  async likeBeatComment(
    @Request() req: UserRequest,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.beatService.addBeatCommentLike(commentId, req.user);
  }

  @Delete(':id/comment/:comment_id/like')
  @HttpCode(204)
  async hateBeatComment(
    @Request() req: UserRequest,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.beatService.deleteBeatCommentLike(commentId, req.user);
  }

  @Get(':id/tag')
  async getBeatTag(@Param('id') id: number) {
    return await this.beatService.getBeatTags(id);
  }
  @Put(':id/tag')
  async voteBeatTag(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Body() voteBeatTagDto: VoteBeatTagDto,
  ) {
    await this.beatService.addBeatTag(id, voteBeatTagDto.tag, req.user);
    return new Message('success');
  }
}
