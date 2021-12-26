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
import { BPM, Language } from '../../common/entity/music.entity';

export class TagSearchDto {
  @Matches(/^[1-9][0-9]*$/)
  seed: string;

  @IsOptional()
  @IsEnum(Tag, { each: true })
  tags: Tag[] = [];

  @Matches(/^0$|^[1-9][0-9]*$/)
  index: string;

  @IsOptional()
  size: number = 5;

  @IsOptional()
  @IsEnum(BPM)
  bpm: BPM;
}
