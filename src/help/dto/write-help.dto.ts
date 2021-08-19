import { PickType } from '@nestjs/mapped-types';
import { Help } from '../../common/entity/help.entity';
import { IsNumber, IsOptional } from 'class-validator';

export class WriteHelpDto extends PickType(Help, [
  'contents',
  'email',
  'name',
  'title',
  'type',
]) {}
