import { IsNumber } from 'class-validator';

export class GetNoticeDto {
  @IsNumber()
  index: number;

  @IsNumber()
  size: number;
}
