import {
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Tag } from '../../common/entity/beat-tag-value.entity';

export class TagBeatSearchDto {
  @Matches(/^[1-9][0-9]*$/)
  seed: string;

  @IsOptional()
  @IsEnum(Tag, { each: true })
  tags: Tag[] = [];

  @Matches(/^0$|^[1-9][0-9]*$/)
  index: string;

  @IsOptional()
  size: number = 5;
}
