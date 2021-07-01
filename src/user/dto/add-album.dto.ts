import { IsBoolean, IsString } from 'class-validator';

export class AddAlbumDto {
  @IsString()
  name: string;

  @IsBoolean()
  isPublic: boolean;
}
