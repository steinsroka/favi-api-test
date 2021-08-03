import {
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { Tag } from '../../common/entity/music-tag-value.entity';

export class TagSearchDto {
  @Matches(/^[1-9][0-9]*$/)
  seed: string;

  @IsOptional()
  @IsEnum(Tag, { each: true })
  tags: Tag[] = [];

  @Matches(/^[1-9][0-9]*$/)
  index: string;

  @IsOptional()
  size: number = 5;
}
