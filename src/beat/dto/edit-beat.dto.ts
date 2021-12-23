import { PartialType, PickType } from '@nestjs/mapped-types';
import { Beat } from '../../common/entity/beat.entity';

export class EditBeatDto extends PartialType(
  PickType(Beat, [
    'title',
    'contents',
    'link',
    'bpm',
    'melodyScale',
    'language',
    'vocalType',
    'rhythmBeat',
  ]),
) {}
