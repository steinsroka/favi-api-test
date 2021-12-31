import { PartialType } from '@nestjs/mapped-types';
import { Music } from 'src/common/entity/music.entity';

export class MusicPartialDto extends PartialType(Music) {}
