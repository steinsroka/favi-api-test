import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { MusicTagValue } from 'src/common/entity/music-tag-value.entity';

export class TagCountDto extends PartialType(
  PickType(MusicTagValue, ['class', 'tag', 'subTag']),
) {
  @IsNumber()
  count: number;
}
