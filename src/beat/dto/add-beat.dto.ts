import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Language, BPM, MelodyScale } from '../../common/entity/beat.entity';

export class AddBeatDto {
  @IsString()
  title: string;

  @IsString()
  contents: string;

  @IsEnum(Language, { each: true })
  @IsOptional()
  language?: Language;

  @IsEnum(BPM, { each: true })
  @IsOptional()
  bpm?: BPM;

  @IsEnum(MelodyScale, { each: true })
  @IsOptional()
  melodyScale?: MelodyScale;
}
