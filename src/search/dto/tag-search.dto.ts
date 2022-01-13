import {
  IsEnum,
  IsOptional,
  Matches,
  IsIn,
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

  @IsIn([0,1])
  @IsOptional()
  tag_response: number = 1;

  @IsOptional()
  @IsEnum(BPM)
  bpm: BPM;
}
