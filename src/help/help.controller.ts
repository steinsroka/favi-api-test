import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GuestableAuthGuard } from '../auth/guard/guestable-auth.guard';
import { Help } from '../common/entity/help.entity';
import { GetHelpDto } from './dto/get-help.dto';
import { WriteHelpDto } from './dto/write-help.dto';
import { HelpService } from './help.service';

@Controller('help')
@UseGuards(GuestableAuthGuard)
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @Get()
  async getHelps(@Query() getHelpDto: GetHelpDto): Promise<Help[]> {
    console.log(typeof getHelpDto.index);
    return await this.helpService.getHelps(getHelpDto.index, getHelpDto.size, getHelpDto.userId);
  }

  @Post()
  async writeHelp(@Body() writeHelpDto: WriteHelpDto): Promise<Help> {
    return await this.helpService.writeHelp(writeHelpDto);
  }
}
