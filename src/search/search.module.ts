import { Module } from '@nestjs/common';
import { MusicModule } from '../music/music.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [MusicModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
