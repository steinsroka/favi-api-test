import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class AddAlbumDto {
  @ApiProperty({
    description: "앨범 이름",
    example: "리듬 비트"
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "공개 여부",
    example : false,
  })
  @IsBoolean()
  isPublic: boolean;
}
