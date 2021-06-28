import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../common/entity/music-tag-value.entity';
import { Repository } from 'typeorm';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(MusicTagInfo)
    private readonly musicTagInfoRepository: Repository<MusicTagInfo>,
  ) {}

  getMusicsMatchedTag(tags: Tag[], seed: number, index: number) {
    return this.musicTagInfoRepository
      .createQueryBuilder()
      .select(
        `SUM(CASE WHEN name IN(${tags.join(',')}) THEN 1 ELSE 0 END)`,
        'match',
      )
      .addSelect('musicId', 'musicId')
      .where('rank <= 3')
      .groupBy('musicId')
      .orderBy('match', 'DESC')
      .addOrderBy(`RAND(${seed})`)
      .getRawMany();
  }
}
