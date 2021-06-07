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

@Controller('music')
@UseGuards(JwtAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get(':id')
  async getMusicInfo(@Param('id') id: string): Promise<MusicInfo> {
    return await this.musicService.getMusic(id);
  }

  @Put(':id/like')
  async likeMusic(@Request() req: UserRequest, @Param('id') id: string): Promise<Message> {
    await this.musicService.addMusicLike(id, req.user);
    return new Message('success');
  }

  @Delete(':id/like')
  @HttpCode(204)
  async hateMusic(@Request() req: UserRequest, @Param('id') id: string): Promise<void> {
    await this.musicService.deleteMusicLike(id, req.user);
  }

  @Get(':id/comment')
  async getMusicComments(
    @Param('id') id: string,
    @Query('index') index?: number,
  ): Promise<MusicComment[]> {
    return await this.musicService.getMusicComments(id, index);
  }

  @Post(':id/comment')
  async addMusicComment(
    @Request() req: UserRequest,
    @Param('id') id: string,
    @Body() addMusicCommentDto: AddMusicCommentDto,
  ): Promise<Message> {
    const comment = await this.musicService.addMusicComment(id, req.user, addMusicCommentDto.comment);
    addMusicCommentDto.tags?.map((value: Tag) => {this.musicService.addMusicTag(id, value, req.user, comment.id)});
    // addMusicCommentDto.tags?.forEach(async (value: Tag) => {await this.musicService.addMusicTag(id, value, req.user, comment.id)});
    return new Message('success');
  }

  @Delete(':id/comment/:comment_id')
  @HttpCode(204)
  async deleteMusicComment(@Param('comment_id') commentId: number): Promise<void> {
    await this.musicService.deleteMusicComment(commentId);
  }

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
  async likeMusicComment(
    @Request() req: UserRequest,
    @Param('comment_id') commentId: number,
  ) {
    return await this.musicService.addMusicCommentLike(commentId, req.user);
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
  async getMusicTag(@Param('id') id: string) {
    return await this.musicService.getMusicTag(id);
  }

  @Post(':id/tag')
  async voteMusicTag(@Request() req: UserRequest, @Param('id') id: string, @Body() voteMusicTagDto: VoteMusicTagDto) {
    return await this.musicService.addMusicTag(id, voteMusicTagDto.tag, req.user, voteMusicTagDto.musicCommentId);
  }

  @Post(':id/play')
  logMusicPlay(@Param('id') id: string) {}
 }
