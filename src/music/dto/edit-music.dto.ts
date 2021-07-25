import { PartialType, PickType } from '@nestjs/mapped-types';
import { Music } from '../../common/entity/music.entity';

export class EditMusicDto extends PartialType(
  PickType(Music, ['link', 'bpm', 'melodyScale', 'language', 'vocalType', 'copyright', 'rhythmBeat']),
) {}
