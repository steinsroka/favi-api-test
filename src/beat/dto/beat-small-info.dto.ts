import { IsNumber, IsString } from 'class-validator';

export class BeatSmallInfoDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  contents: string;

}
