import { IsNumber, IsOptional } from 'class-validator';

export class GetHelpDto {
  @IsNumber()
  index: number;

  @IsNumber()
  size: number;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
