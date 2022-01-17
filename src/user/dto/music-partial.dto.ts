import { PartialType } from '@nestjs/swagger';
import { Music } from '../../common/entity/music.entity';

export class MusicPartialDto extends PartialType(Music) {}
