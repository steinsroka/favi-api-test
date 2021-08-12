import { PickType } from '@nestjs/mapped-types';
import { Notice } from '../../common/entity/notice.entity';

export class WriteNoticeDto extends PickType(Notice, ['title', 'content']) {}
