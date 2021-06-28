import { Connection, ViewColumn, ViewEntity } from 'typeorm';
import { MusicTagValue, Tag, TagClass } from '../entity/music-tag-value.entity';
import { MusicTag } from '../entity/music-tag.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('*')
      .addSelect(
        'RANK() OVER(PARTITION BY tagData.userId ORDER BY tagData.count DESC)',
        'rank',
      )
      .from(
        (qb) =>
          qb
            .distinct(true)
            .select('musicTagValue.name', 'name')
            .addSelect('musicTag.userId', 'userId')
            .addSelect('musicTagValue.class', 'class')
            .addSelect('musicTagValue.parent', 'parent')
            .addSelect(
              'COUNT(*) OVER(PARTITION BY musicTag.userId, musicTag.musicTagValueId)',
              'count',
            )
            .addSelect(
              'COUNT(*) OVER(PARTITION BY musicTag.userId, musicTag.musicTagValueId) / COUNT(*) OVER(PARTITION BY musicTag.userId) * 100',
              'ratio',
            )
            .addSelect(
              'COUNT(*) OVER(PARTITION BY musicTag.userId, musicTag.musicTagValueId) / COUNT(*) OVER(PARTITION BY musicTag.userId, musicTagValue.class) * 100',
              'classRatio',
            )
            .from(MusicTag, 'musicTag')
            .leftJoin('musicTag.musicTagValue', 'musicTagValue'),
        'tagData',
      )
      .orderBy('count', 'DESC'),
})
export class UserTagInfo {
  @ViewColumn()
  userId: number;

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
