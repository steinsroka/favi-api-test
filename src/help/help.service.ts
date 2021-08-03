import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Help } from '../common/entity/help.entity';
import { Repository } from 'typeorm';
import { WriteHelpDto } from './dto/write-help.dto';

@Injectable()
export class HelpService {
  constructor(
    @InjectRepository(Help) private readonly helpRepository: Repository<Help>,
  ) {}

  async writeHelp(writeHelpDto: WriteHelpDto): Promise<Help> {
    const newHelp = this.helpRepository.create(writeHelpDto);
    return await this.helpRepository.save(newHelp);
  }
}
