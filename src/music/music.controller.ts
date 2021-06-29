import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Message } from '../common/class/message';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UserRequest } from '../common/@types/user-request';
import { MusicService } from './music.service';
import { MusicInfo } from '../common/view/music-info.entity';
import { AddMusicCommentDto } from './dto/add-music-comment.dto';
import { MusicComment } from '../common/entity/music-comment.entity';
import { EditMusicCommentDto } from './dto/edit-music-comment.dto';
import { VoteMusicTagDto } from './dto/vote-music-tag.dto';
import { Tag } from '../common/entity/music-tag-value.entity';
import { InsertResult } from 'typeorm';
import { MusicCommentInfo } from 'src/common/view/music-comment-info.entity';
import { MusicCommentAuthGuard } from './guard/music-comment-auth.guard';
import { ValidateMusicPipe } from './pipe/validate-music.pipe';

@Controller('music')
@UseGuards(JwtAuthGuard)
@UsePipes(ValidateMusicPipe)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get(':id')
  async getMusicInfo(@Param('id') id: number): Promise<MusicInfo> {
    const music = await this.musicService.getMusic(id);
    music.tags = await this.musicService.getMusicTags(id);
    return music;
  }

  @Put(':id/like')
  @HttpCode(204)
  async likeMusic(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.musicService.addMusicLike(id, req.user);
  }

  @Delete(':id/like')
  @HttpCode(204)
  async hateMusic(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.musicService.deleteMusicLike(id, req.user);
  }

  @Get(':id/comment')
  async getMusicComments(
    @Param('id') id: number,
    @Query('index') index?: number,
  ): Promise<MusicCommentInfo[]> {
    const musicComments = await this.musicService.getMusicComments(id, index);
    for (let i = 0; i < musicComments.length; i++) {
      musicComments[i].tags = await this.musicService.getMusicCommentTags(
        musicComments[i].id,
      );
    }
    return musicComments;
  }

  @Post(':id/comment')
  async addMusicComment(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Body() addMusicCommentDto: AddMusicCommentDto,
  ): Promise<Message> {
    const comment = await this.musicService.addMusicComment(
      id,
      req.user,
      addMusicCommentDto.comment,
      addMusicCommentDto.parent
    );
    const addMusicPromise:
      | Promise<InsertResult>[]
      | undefined = addMusicCommentDto.tags?.map((value: Tag) =>
      this.musicService.addMusicTag(id, value, req.user, comment.id),
    );
    await Promise.all(addMusicPromise ?? []);
    return new Message('success');
  }

  @UseGuards(MusicCommentAuthGuard)
  @Delete(':id/comment/:comment_id')
  @HttpCode(204)
  async deleteMusicComment(
    @Param('id') id: number,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.musicService.deleteMusicComment(commentId);
  }

  @UseGuards(MusicCommentAuthGuard)
  @Patch(':id/comment/:comment_id')
  async editMusicComment(
    @Param('comment_id') commentId: number,
    @Body() editMusicCommentDto: EditMusicCommentDto,
  ): Promise<MusicComment> {
    return await this.musicService.updateMusicComment(
      commentId,
      editMusicCommentDto.newComment,
    );
  }

  @Put(':id/comment/:comment_id/like')
  @HttpCode(204)
  async likeMusicComment(
    @Request() req: UserRequest,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.musicService.addMusicCommentLike(commentId, req.user);
  }

  @Delete(':id/comment/:comment_id/like')
  @HttpCode(204)
  async hateMusicComment(
    @Request() req: UserRequest,
    @Param('comment_id') commentId: number,
  ): Promise<void> {
    await this.musicService.deleteMusicCommentLike(commentId, req.user);
  }

  @Get(':id/tag')
  async getMusicTag(@Param('id') id: number) {
    return await this.musicService.getMusicTags(id);
  }

  @Put(':id/tag')
  async voteMusicTag(
    @Request() req: UserRequest,
    @Param('id') id: number,
    @Body() voteMusicTagDto: VoteMusicTagDto,
  ) {
    await this.musicService.addMusicTag(id, voteMusicTagDto.tag, req.user);
    return new Message('success');
  }

  @Post(':id/play')
  logMusicPlay(@Param('id') id: number) {}
}
