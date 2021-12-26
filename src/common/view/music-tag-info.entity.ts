import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { MusicTagValue, Tag, TagClass } from '../entity/music-tag-value.entity';
import { MusicTag } from '../entity/music-tag.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'RANK() OVER(PARTITION BY tagData.musicId ORDER BY tagData.count DESC)',
        'rank',
      )
      .from(
        (qb) =>
          qb
            .distinct(true)
            .select('musicTagValue.name', 'name')
            .addSelect('musicTag.musicId', 'musicId')
            .addSelect('musicTagValue.class', 'class')
            .addSelect('musicTagValue.parent', 'parent')
            .addSelect(
              'COUNT(*) OVER(PARTITION BY musicTag.musicId, musicTag.musicTagValueId)',
              'count',
            )
            .addSelect(
              'COUNT(*) OVER(PARTITION BY musicTag.musicId, musicTag.musicTagValueId) / COUNT(*) OVER(PARTITION BY musicTag.musicId) * 100',
              'ratio',
            )
            .addSelect(
              'COUNT(*) OVER(PARTITION BY musicTag.musicId, musicTag.musicTagValueId) / COUNT(*) OVER(PARTITION BY musicTag.musicId, musicTagValue.class) * 100',
              'classRatio',
            )
            .addSelect(
              'music.bpm',
              'bpm'
            )
            .addSelect(
              'music.language',
              'language'
            )
            .from(MusicTag, 'musicTag')
            .leftJoin('musicTag.musicTagValue', 'musicTagValue'),
            .leftJoin('musicTag.music', 'music'),
        'tagData',
      )
      .orderBy('count', 'DESC'),
})
export class MusicTagInfo {
  @ViewColumn()
  musicId: number;

  @ViewColumn()
  name: Tag;

  @ViewColumn()
  class: TagClass;

  @ViewColumn()
  parent: Tag;

  @ViewColumn()
  count: number;

  @ViewColumn()
  ratio: number;

  @ViewColumn()
  classRatio: number;

  @ViewColumn()
  rank: number;
}
