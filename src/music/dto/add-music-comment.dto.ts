import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Tag } from '../../common/entity/music-tag-value.entity';

export class AddMusicCommentDto {
  @IsString()
  comment: string;

  @IsEnum(Tag, { each: true })
  @IsOptional()
  tags?: Tag[];

  @IsString()
  @IsOptional()
  parent: number;
}
