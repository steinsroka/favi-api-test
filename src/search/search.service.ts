import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from '../common/entity/music-tag-value.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { TagSearchResultDto } from './dto/tag-search-result.dto';
import { TagBeatSearchResultDto } from './dto/tag-beat-search-result.dto';
import { MusicSmallInfoDto } from '../music/dto/music-small-info.dto';
import { Music, BPM } from '../common/entity/music.entity';
import { Beat } from '../common/entity/beat.entity';
import { BeatTagInfo } from '../common/view/beat-tag-info.entity';
import { type } from 'os';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(MusicTagInfo)
    private readonly musicTagInfoRepository: Repository<MusicTagInfo>,
    @InjectRepository(Music)
    private readonly musicRepository: Repository<Music>,
    @InjectRepository(BeatTagInfo)
    private readonly beatTagInfoRepository: Repository<BeatTagInfo>,
    @InjectRepository(Music)
    private readonly beatRepository: Repository<Beat>,
  ) {}

  getMusicsMatchedTag(
    tags: Tag[],
    seed: number,
    index: number,
    size: number,
    bpm: BPM,
  ): Promise<TagSearchResultDto[]> {
    console.log(typeof tags, tags.length);
    if (typeof tags == 'string') {
      return (
        this.musicTagInfoRepository
          .createQueryBuilder()
          .select(
            // `SUM(CASE WHEN name IN("${tags.join('","')}") THEN 1 ELSE 0 END)`,
            `SUM(CASE WHEN name IN("${tags}") THEN 1 ELSE 0 END)`,
            'match',
          )
          .addSelect('musicId', 'musicId')
          .where('`rank` <= 3')
          // .andWhere(bpm!==undefined?`'bpm' = ${bpm}`:'1 = 1')
          .groupBy('musicId')
          .orderBy('`match`', 'DESC')
          .addOrderBy(`RAND(${seed})`)
          .take(size)
          .skip(index * size)
          .getRawMany()
      );
      // .andWhere(`'bpm' = ${bpm}`)
    } else {
      return (
        this.musicTagInfoRepository
          .createQueryBuilder()
          .select(
            `SUM(CASE WHEN name IN("${tags.join('","')}") THEN 1 ELSE 0 END)`,
            // `SUM(CASE WHEN name IN("${tags}") THEN 1 ELSE 0 END)`,
            'match',
          )
          .addSelect('musicId', 'musicId')
          .where('`rank` <= 3')
          // .andWhere(bpm!==undefined?`'bpm' = ${bpm}`:'1 = 1')
          .groupBy('musicId')
          .orderBy('`match`', 'DESC')
          .addOrderBy(`RAND(${seed})`)
          .take(size)
          .skip(index * size)
          .getRawMany()
      );
      // .andWhere(`'bpm' = ${bpm}`)

    }
  }
  getBeatsMatchedTag(
    tags: Tag[],
    seed: number,
    index: number,
    size: number,
  ): Promise<TagBeatSearchResultDto[]> {
    return this.beatTagInfoRepository
      .createQueryBuilder()
      .select(
        `SUM(CASE WHEN name IN("${tags.join('","')}") THEN 1 ELSE 0 END)`,
        'match',
      )
      .addSelect('beatId', 'beatId')
      .where('`rank` <= 3')
      .groupBy('beatId')
      .orderBy('`match`', 'DESC')
      .addOrderBy(`RAND(${seed})`)
      .take(size)
      .skip(index * size)
      .getRawMany();
  }

  async getMusicsQuery(
    query: string,
    index: number,
    size: number,
  ): Promise<MusicSmallInfoDto[]> {
    return this.musicRepository.find({
      select: ['id', 'title', 'composer'],
      relations: ['artists'],
      where: (qb: SelectQueryBuilder<Music>) => {
        qb.where('Music.title LIKE :title', {
          title: `%${query}%`,
        }).orWhere('Music__artists.name LIKE :name', { name: `%${query}%` });
      },
      take: size,
      skip: index * size,
    });
  }
}
