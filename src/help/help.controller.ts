import { Body, Controller, Post } from '@nestjs/common';
import { Help } from '../common/entity/help.entity';
import { WriteHelpDto } from './dto/write-help.dto';
import { HelpService } from './help.service';

@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Post()
  async writeHelp(@Body() writeHelpDto: WriteHelpDto): Promise<Help> {
    return await this.helpService.writeHelp(writeHelpDto);
  }
}
