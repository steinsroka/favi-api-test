import { IsString } from 'class-validator';

export class AddMusicCommentDto {
  @IsString()
  comment: string;
}
