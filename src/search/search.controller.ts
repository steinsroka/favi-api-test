import { Controller, Get, Query } from '@nestjs/common';
import { Tag } from '../common/entity/music-tag-value.entity';
import { TagSearchResultDto } from './dto/tag-search-result.dto';
import { TagSearchDto } from './dto/tag-search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('music/tag')
  async searchMusicWithTags(
    @Query() tagSearchDto: TagSearchDto,
  ): Promise<TagSearchResultDto[]> {
    return await this.searchService.getMusicsMatchedTag(
      tagSearchDto.tags,
      parseInt(tagSearchDto.seed),
      parseInt(tagSearchDto.index),
    );
  }

  @Get('name')
  async searchMusicWithName(@Query('name') name: string) {}
}
