import { Controller, Param, Post, Body, Get, Query } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { Notice } from '../common/entity/notice.entity';
import { WriteNoticeDto } from './dto/write-notice.dto';
import { GetNoticeDto } from './dto/get-notice.dto';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  PickType,
} from '@nestjs/swagger';

@ApiTags('Notice(공지) 관련 API')
@Controller('notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @ApiOperation({ summary: '공지사항 조회 (최신순)' })
  @ApiQuery({
    name: 'index',
    description:
      'Page 번호입니다. 예를 들어 2이고, size = 10인 경우 20~30번 글을 불러옵니다. 0이 가장 최신 글입니다.',
    example: 0,
  })
  @ApiQuery({
    name: 'size',
    description: '한 번에 가져올 개수입니다.',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공 (size 만큼 반환)',
    isArray: true,
    type: Notice,
  })
  @Get()
  async getNotice(@Query() getNoticeDto: GetNoticeDto): Promise<Notice[]> {
    return await this.noticeService.getNotice(
      getNoticeDto.index,
      getNoticeDto.size,
    );
  }

  @ApiOperation({
    summary:
      '공지사항 작성 ( TODO : 권한 지정 필요 , 현재는 권한 없어서 아무나 작성 가능 )',
  })
  @ApiBody({
    type: PickType(Notice, ['title', 'content']),
  })
  @ApiResponse({
    status: 201,
    description: '작성 성공 (작성된 공지사항 객체 반환)',
    isArray: true,
    type: Notice,
  })
  @Post()
  async writeNotice(@Body() writeNoticeDto: WriteNoticeDto): Promise<Notice> {
    console.log(writeNoticeDto);
    return await this.noticeService.writeNotice(writeNoticeDto);
  }
}
