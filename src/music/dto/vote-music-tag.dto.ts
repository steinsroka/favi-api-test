import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Tag } from '../../common/entity/music-tag-value.entity';

export class VoteMusicTagDto {
  @ApiProperty({
    example:"metal"
  })
  @IsEnum(Tag)
  tag: Tag;
}
