import { IsNumber } from "class-validator";

export class TagSearchResultDto {
  @IsNumber()
  match: number;

  @IsNumber()
  musicId: number;
}