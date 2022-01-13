import { ApiProperty } from '@nestjs/swagger';
import { IsArray, isArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Tag } from 'src/common/entity/music-tag-value.entity';

export class AddAlbumDto {
  @ApiProperty({
    description: "앨범 이름",
    example: "내 앨범"
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "공개 여부",
    example : false,
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    description: "앨범에 추가할 태그",
    enum : Tag,
    isArray: true,
    example: ["confidence", "rain"]
  })
  @IsOptional()
  @IsEnum(Tag, {each : true})
  tags : Tag[];
}
