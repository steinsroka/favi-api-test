import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { MusicTagValue } from 'src/common/entity/music-tag-value.entity';

export class MusicCommentTagDto extends PartialType(
  PickType(MusicTagValue, ['class', 'name', 'parent']),
) {}
