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

  async writeNotice(title:string, content:string): Promise<Notice> {
    let newNotice = new Notice();
    newNotice.content = content;
    newNotice.title = title;
    return await this.noticeRepository.save(newNotice);
  }
}
