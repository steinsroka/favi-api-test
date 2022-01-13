import { PickType } from '@nestjs/swagger';
import { Help } from '../../common/entity/help.entity';

export class GuestWriteHelpDto extends PickType(Help, [
  'email',
  'contents',
  'title',
  'type',
]) {}
