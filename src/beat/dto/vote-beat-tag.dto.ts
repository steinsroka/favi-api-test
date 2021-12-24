import { IsEnum, IsNumber } from 'class-validator';
import { Tag } from '../../common/entity/beat-tag-value.entity';

export class VoteBeatTagDto {
  @IsEnum(Tag)
  tag: Tag;
}
