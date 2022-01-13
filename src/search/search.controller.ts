import { Controller, Get, Query } from '@nestjs/common';
import { MusicInfo } from '../common/view/music-info.entity';
import { BeatInfo } from '../common/view/beat-info.entity';
import { Tag } from '../common/entity/music-tag-value.entity';
import { TagSearchDto } from './dto/tag-search.dto';
import { TagBeatSearchDto } from './dto/tag-beat-search.dto';
import { SearchService } from './search.service';
import { MusicService } from '../music/music.service';
import { BeatService } from '../beat/beat.service';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MusicSmallInfoDto } from '../music/dto/music-small-info.dto';
import { BPM } from '../common/entity/music.entity';

@ApiTags('Search(검색) 관련 APi')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly musicService: MusicService,
    private readonly beatService: BeatService,
  ) {}

  @ApiOperation({summary: "음악 태그 검색 (TODO : bpm 검색에서 사용하도록 변경 필요)" })
  @ApiQuery({
    name:'seed',
    description:"랜덤 시드 숫자(정수형 값 입력), Seed에 따라 검색 결과가 달라짐.",
    example:'42'
  })
  @ApiQuery({
    name:'tags',
    description:"태그 배열, 입력하지 않을 시 완전 랜덤 검색",
    isArray: true,
    enum: Tag,
    required:false
  })
  @ApiQuery({
    name : 'tag_response',
    description: "Response Data에 태그 필요한지? 0: 태그 미포함, 1: 태그 포함, 기본값 : 1 (태그 포함)",
    enum : [0,1],
    required: false
  })
  @ApiQuery({
    name:'index',
    description:"index (예를 들어 size = 10, index = 2 인 경우 20~30번째 결과 가져옴)",
    example: 0
  })
  @ApiQuery({
    name:"size",
    description:"한 번에 가져올 개수입니다.",
    example: 10
  })
  @ApiQuery({
    name:"bpm",
    description:"곡의 bpm입니다. (현재 사용되지 않음)",
    enum: BPM,
    required: false
  })
  @ApiResponse({
    status:200,
    description: "검색 결과 배열 반환",
    isArray: true,
    type:MusicInfo
  })
  @Get('music/tag')
  async searchMusicWithTags(
    @Query() tagSearchDto: TagSearchDto,
  ): Promise<MusicInfo[]> {
    console.log(typeof(tagSearchDto.tags))
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
    const musics: MusicInfo[] = await this.musicService.getMusics(ids, tagSearchDto.tag_response);
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

  @ApiOperation({summary: "음악 검색"})
  @ApiQuery({
    name:'query',
    description:"문자열 쿼리 ( 사용자가 검색한 내용 )",
    example: "BTS"
  })
  @ApiQuery({
    name:'index',
    description:"index (예를 들어 size = 10, index = 2 인 경우 20~30번째 결과 가져옴)",
    example: 0
  })
  @ApiQuery({
    name:"size",
    description:"한 번에 가져올 개수입니다.",
    example: 10
  })
  @ApiResponse({
    status:200,
    description: "검색 결과 배열 반환",
    isArray: true,
    type:MusicSmallInfoDto
  })
  @Get()
  async searchMusicQuery(
    @Query('query') query: string,
    @Query('index') index: number,
    @Query('size') size: number,
  ) {
    return await this.searchService.getMusicsQuery(query, index, size);
  }
}
