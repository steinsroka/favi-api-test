import { PickType } from '@nestjs/mapped-types';
import { Help } from '../../common/entity/help.entity';

export class WriteHelpDto extends PickType(Help, ['contents', 'email', 'name', 'title', 'type']) {}