import { IsNumber } from 'class-validator';

export class TagBeatSearchResultDto {
  @IsNumber()
  match: number;

  @IsNumber()
  beatId: number;
}
