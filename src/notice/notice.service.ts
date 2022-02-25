import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from '../common/entity/notice.entity';
import { WriteNoticeDto } from './dto/write-notice.dto';
import {
  Repository,
  DeleteResult,
  In,
  getRepository,
  createQueryBuilder,
} from 'typeorm';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  async getNotice(index: number, size: number): Promise<Notice[]> {
    return await this.noticeRepository.find({
      order: { timestamp: 'DESC' },
      take: size,
      skip: index * size,
    });
  }

  async writeNotice(writeNoticeDto: WriteNoticeDto): Promise<Notice> {
    const newNotice = this.noticeRepository.create(writeNoticeDto);
    console.log(newNotice + 'this is log');
    return await this.noticeRepository.save(newNotice);
  }
}
