import { IsNumber, IsString } from 'class-validator';
import { JoinArtistDTO } from 'src/search/dto/joined-search-atrist.dto';

export class MusicSmallInfoDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  composer: string;

  artists: JoinArtistDTO[];
}
