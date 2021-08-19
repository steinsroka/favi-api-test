import { Controller, Get, Query } from '@nestjs/common';
import { MusicInfo } from '../common/view/music-info.entity';
import { Tag } from '../common/entity/music-tag-value.entity';
import { TagSearchResultDto } from './dto/tag-search-result.dto';
import { TagSearchDto } from './dto/tag-search.dto';
import { SearchService } from './search.service';
import { MusicService } from '../music/music.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService, private readonly musicService: MusicService) {}

  @Get('music/tag')
  async searchMusicWithTags(
    @Query() tagSearchDto: TagSearchDto,
  ): Promise<MusicInfo[]> {
    const musicIds = await this.searchService.getMusicsMatchedTag(
      tagSearchDto.tags,
      parseInt(tagSearchDto.seed),
      parseInt(tagSearchDto.index),
      tagSearchDto.size,
    );
    const musics: MusicInfo[] = [];
    for(const key of musicIds) {
      musics.push(await this.musicService.getMusic(key.musicId));
    }
    return musics;
  }

  @Get()
  async searchMusicQuery(
    @Query('query') query: string,
    @Query('index') index: number = 0,
    @Query('size') size: number = 5,
  ) {
    return await this.searchService.getMusicsQuery(query, index, size);
  }
}
