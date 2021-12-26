import { Controller, Get, Query } from '@nestjs/common';
import { MusicInfo } from '../common/view/music-info.entity';
import { BeatInfo } from '../common/view/beat-info.entity';
import { Tag } from '../common/entity/music-tag-value.entity';
import { TagSearchResultDto } from './dto/tag-search-result.dto';
import { TagSearchDto } from './dto/tag-search.dto';
import { TagBeatSearchResultDto } from './dto/tag-beat-search-result.dto';
import { TagBeatSearchDto } from './dto/tag-beat-search.dto';
import { SearchService } from './search.service';
import { MusicService } from '../music/music.service';
import { BeatService } from '../beat/beat.service';

@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly musicService: MusicService,
    private readonly beatService: BeatService,
  ) {}

  @Get('music/tag')
  async searchMusicWithTags(
    @Query() tagSearchDto: TagSearchDto,
  ): Promise<MusicInfo[]> {
    const musicIds = await this.searchService.getMusicsMatchedTag(
      tagSearchDto.tags,
      parseInt(tagSearchDto.seed),
      parseInt(tagSearchDto.index),
      tagSearchDto.size,
      tagSearchDto.bpm
    );
    const ids: number[] = [];
    for(const key of musicIds) {
      ids.push(key.musicId);
    }
    const musics: MusicInfo[] = await this.musicService.getMusics(ids);
    return musics;
  }
  @Get('beat/tag')
  async searchBeatWithTags(
    @Query() tagBeatSearchDto: TagBeatSearchDto,
  ): Promise<BeatInfo[]> {
    const beatIds = await this.searchService.getBeatsMatchedTag(
      tagBeatSearchDto.tags,
      parseInt(tagBeatSearchDto.seed),
      parseInt(tagBeatSearchDto.index),
      tagBeatSearchDto.size,
    );
    const ids: number[] = [];
    for(const key of beatIds) {
      ids.push(key.beatId);
    }
    const beats: BeatInfo[] = await this.beatService.getBeats(ids);
    return beats;
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
