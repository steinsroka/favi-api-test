import { PickType } from '@nestjs/swagger';
import { Help } from '../../common/entity/help.entity';

export class WriteHelpDto extends PickType(Help, [
  'contents',
  'title',
  'type',
]) {}
