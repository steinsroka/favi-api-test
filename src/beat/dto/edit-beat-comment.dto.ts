import { IsString } from 'class-validator';

export class EditBeatCommentDto {
  @IsString()
  newComment: string;
}
