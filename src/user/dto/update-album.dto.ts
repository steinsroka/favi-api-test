import { PartialType } from '@nestjs/swagger';
import { AddAlbumDto } from './add-album.dto';

export class updateAlbumDto extends PartialType(AddAlbumDto) {}
