import { IsNumber, IsString } from 'class-validator';

export class MusicSmallInfoDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  composer: string;
}