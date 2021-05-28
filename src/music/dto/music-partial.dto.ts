import { PartialType } from '@nestjs/mapped-types';
import { Music } from '../../common/entity/music.entity';

export class MusicPartialDto extends PartialType(Music) {}
