import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { BeatTagValue } from 'src/common/entity/music-tag-value.entity';

export class BeatCommentTagDto extends PartialType(
  PickType(BeatTagValue, ['class', 'name', 'parent']),
) {}
