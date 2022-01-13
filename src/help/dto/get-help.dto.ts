import { IsNumber } from 'class-validator';

export class GetHelpDto {
  @IsNumber()
  index: number;

  @IsNumber()
  size: number;
}