import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../common/entity/music-tag-value.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { TagSearchResultDto } from './dto/tag-search-result.dto';
import { MusicSmallInfoDto } from '../music/dto/music-small-info.dto';
import { Music } from '../common/entity/music.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(MusicTagInfo)
    private readonly musicTagInfoRepository: Repository<MusicTagInfo>,
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>
  ) {}

  getMusicsMatchedTag(
    tags: Tag[],
    seed: number,
    index: number,
  ): Promise<TagSearchResultDto[]> {
    return this.musicTagInfoRepository
      .createQueryBuilder()
      .select(
        `SUM(CASE WHEN name IN("${tags.join('","')}") THEN 1 ELSE 0 END)`,
        'match',
      )
      .addSelect('musicId', 'musicId')
      .where('rank <= 3')
      .groupBy('musicId')
      .orderBy('`match`', 'DESC')
      .addOrderBy(`RAND(${seed})`)
      .take(5)
      .skip(index * 5)
      .getRawMany();
  }

  async getMusicsQuery(query: string, index: number): Promise<MusicSmallInfoDto[]> {
    return this.musicRepository.find({
      select: ['id', 'title', 'composer'],
      relations: ['artists'],
      where: (qb: SelectQueryBuilder<Music>) => {
        qb
          .where('Music.title LIKE :title', {title: `%${query}%`})
          .orWhere('Music__artists.name LIKE :name', {name: `%${query}%`});
      },
      take: 5,
      skip: index * 5
    });
  }
}
