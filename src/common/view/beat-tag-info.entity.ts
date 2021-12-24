import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { BeatTagValue, Tag, TagClass } from '../entity/beat-tag-value.entity';
import { BeatTag } from '../entity/beat-tag.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'RANK() OVER(PARTITION BY tagData.beatId ORDER BY tagData.count DESC)',
        'rank',
      )
      .from(
        (qb) =>
          qb
            .distinct(true)
            .select('beatTagValue.name', 'name')
            .addSelect('beatTag.musicId', 'musicId')
            .addSelect('beatTagValue.class', 'class')
            .addSelect('beatTagValue.parent', 'parent')
            .addSelect(
              'COUNT(*) OVER(PARTITION BY beatTag.beatId, beatTag.beatTagValueId)',
              'count',
            )
            .addSelect(
              'COUNT(*) OVER(PARTITION BY beatTag.beatId, beatTag.beatTagValueId) / COUNT(*) OVER(PARTITION BY beatTag.beatId) * 100',
              'ratio',
            )
            .addSelect(
              'COUNT(*) OVER(PARTITION BY beatTag.beatId, beatTag.beatTagValueId) / COUNT(*) OVER(PARTITION BY beatTag.beatId, beatTagValue.class) * 100',
              'classRatio',
            )
            .from(MusicTag, 'musicTag')
            .leftJoin('beatTag.beatTagValue', 'beatTagValue'),
        'tagData',
      )
      .orderBy('count', 'DESC'),
})
export class BeatTagInfo {
  @ViewColumn()
  beatId: number;

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
