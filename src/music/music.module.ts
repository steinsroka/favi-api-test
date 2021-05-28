import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicInfo } from '../common/view/music-info.entity';
import { MusicComment } from '../common/entity/music-comment.entity';
import { MusicTagValue } from '../common/entity/music-tag-value.entity';
import { Music } from '../common/entity/music.entity';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Music, MusicComment, MusicTagValue, MusicInfo]),
  ],
  exports: [TypeOrmModule],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
