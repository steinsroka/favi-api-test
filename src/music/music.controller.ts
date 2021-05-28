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
import { MusicComment } from 'src/common/entity/music-comment.entity';
import { EditMusicCommentDto } from './dto/edit-music-comment.dto';

@Controller('music')
@UseGuards(JwtAuthGuard)
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get(':id')
  getMusicInfo(@Param('id') id: string): Promise<MusicInfo> {
    return this.musicService.getMusic(id);
  }

  @Put(':id/like')
  likeMusic(@Request() req: UserRequest, @Param('id') id: string): Message {
    this.musicService.addMusicLike(id, req.user);
    return new Message('success');
  }

  @Delete(':id/like')
  @HttpCode(204)
  hateMusic(@Request() req: UserRequest, @Param('id') id: string): void {
    this.musicService.deleteMusicLike(id, req.user);
  }

  @Get(':id/comment')
  getMusicComments(
    @Param('id') id: string,
    @Query('index') index?: number,
  ): Promise<MusicComment[]> {
    return this.musicService.getMusicComments(id, index);
  }

  @Post(':id/comment')
  addMusicComment(
    @Request() req: UserRequest,
    @Param('id') id: string,
    @Body() addMusicCommentDto: AddMusicCommentDto,
  ): Message {
    this.musicService.addMusicComment(id, req.user, addMusicCommentDto.comment);
    return new Message('success');
  }

  @Delete(':id/comment/:comment_id')
  @HttpCode(204)
  deleteMusicComment(@Param('comment_id') commentId: number): void {
    this.musicService.deleteMusicComment(commentId);
  }

  @Patch(':id/comment/:comment_id')
  editMusicComment(
    @Param('comment_id') commentId: number,
    @Body() editMusicCommentDto: EditMusicCommentDto,
  ): Promise<MusicComment> {
    return this.musicService.updateMusicComment(
      commentId,
      editMusicCommentDto.newComment,
    );
  }

  @Put(':id/comment/:comment_id/like')
  likeMusicComment(
    @Param('id') id: string,
    @Param('comment_id') commentId: number,
  ) {}

  @Delete(':id/comment/:comment_id/like')
  @HttpCode(204)
  hateMusicComment(
    @Param('id') id: string,
    @Param('comment_id') commentId: number,
  ) {}

  @Get(':id/tag')
  getMusicTag(@Param('id') id: string) {}

  @Post(':id/tag')
  voteMusicTag(@Param('id') id: string) {}

  @Post(':id/play')
  logMusicPlay(@Param('id') id: string) {}
}
