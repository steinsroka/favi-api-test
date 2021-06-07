import { IsEnum, IsNumber } from "class-validator";
import { Tag } from "../../common/entity/music-tag-value.entity";

export class VoteMusicTagDto {
  @IsEnum(Tag)
  tag: Tag;

  @IsNumber()
  musicCommentId?: number;
}