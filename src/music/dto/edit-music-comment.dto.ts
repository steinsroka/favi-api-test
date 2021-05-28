import { IsString } from "class-validator";

export class EditMusicCommentDto {
  @IsString()
  newComment: string;
}