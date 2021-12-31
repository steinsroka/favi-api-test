import { IsNumber, IsString } from 'class-validator';
import { Artist } from 'src/common/entity/artist.entity';
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
