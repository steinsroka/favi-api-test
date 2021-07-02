import { PartialType } from '@nestjs/mapped-types';
import { Album } from '../../common/entity/album.entity';

export class AlbumPartialDto extends PartialType(Album) {}
