import { Controller, Param, Post, Body, Get, Query } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { Notice } from '../common/entity/notice.entity';
import { WriteNoticeDto } from './dto/write-notice.dto';
import { GetNoticeDto } from './dto/get-notice.dto';
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Get()
  async getNotice(@Query() getNoticeDto: GetNoticeDto): Promise<Notice[]> {
    return await this.noticeService.getNotice(
      getNoticeDto.index,
      getNoticeDto.size,
    );
  }

  @Post()
  async writeNotice(@Body() writeNoticeDto: WriteNoticeDto): Promise<Notice> {
    console.log(writeNoticeDto);
    return await this.noticeService.writeNotice(writeNoticeDto);
  }
}
