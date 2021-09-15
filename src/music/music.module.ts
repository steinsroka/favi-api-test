import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicInfo } from '../common/view/music-info.entity';
import { MusicComment } from '../common/entity/music-comment.entity';
import { MusicTagValue } from '../common/entity/music-tag-value.entity';
import { Music } from '../common/entity/music.entity';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { MusicTag } from '../common/entity/music-tag.entity';
import { MusicArtist } from '../common/entity/music-artist.entity';
import { MusicLike } from '../common/entity/music-like.entity';
import { MusicCommentLike } from '../common/entity/music-comment-like.entity';
import { MusicCommentInfo } from '../common/view/music-comment-info.entity';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { Artist } from '../common/entity/artist.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Music,
      MusicComment,
      MusicArtist,
      MusicTagValue,
      MusicInfo,
      MusicCommentInfo,
      MusicTag,
      MusicLike,
      MusicCommentLike,
      MusicTagInfo,
      Artist,
    ]),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule, MusicService],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
