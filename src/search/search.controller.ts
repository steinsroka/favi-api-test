import { Controller, Get, Query } from '@nestjs/common';
import { Tag } from '../common/entity/music-tag-value.entity';

@Controller('search')
export class SearchController {
  constructor() {}

  @Get('music/tag')
  async searchMusicWithTags(@Query('tags') tags?: Tag[]) {
    console.log(tags);
    return 1;
  }

  @Get('music/name')
  async searchMusicWithName(@Query('name') name: string) {

  }
}
