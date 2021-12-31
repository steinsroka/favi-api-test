import { Request } from '@nestjs/common';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRequest } from '../common/@types/user-request';
import { GuestableAuthGuard } from '../auth/guard/guestable-auth.guard';
import { Help } from '../common/entity/help.entity';
import { GetHelpDto } from './dto/get-help.dto';
import { WriteHelpDto } from './dto/write-help.dto';
import { HelpService } from './help.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, PickType } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('Help(홈페이지 문의사항) 관련 API')
@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  @ApiOperation({summary: "문의사항 조회 (최신순)"})
  @ApiBearerAuth()
  @ApiQuery({
    name:"index",
    description:"Page 번호입니다. 예를 들어 2이고, size = 10인 경우 20~30번 글을 불러옵니다. 0이 가장 최신 글입니다.",
    example: 0
  })
  @ApiQuery({
    name:"size",
    description:"한 번에 가져올 개수입니다.",
    example: 10
  })
  @ApiResponse({
    status:200,
    description: "조회 성공 (size 만큼 반환)",
    isArray: true,
    type:Help,
  })
  @ApiResponse({
    status:401,
    description: "JWT 토큰 만료, 혹은 헤더에 토큰이 없음",
  })
  @Get()
  @UseGuards(JwtAuthGuard)
  async getHelps(@Request() req: UserRequest, @Query() getHelpDto: GetHelpDto): Promise<Help[]> {
    return await this.helpService.getHelps(getHelpDto.index, getHelpDto.size, req.user.id);
  }
  
  @ApiResponse({
    status:201,
    description: "작성 성공",
    type:Help,
  })
  @ApiOperation({summary: "문의사항 작성 (TODO : DB userid가 Unique key임. 확인 후 수정 필요)"})
  @ApiBearerAuth()
  @ApiBody({
    type: PickType(Help, [
      'contents',
      'email',
      'name',
      'title',
      'type',
    ])})
  @Post()
  @UseGuards(GuestableAuthGuard)
  async writeHelp(@Request() req: UserRequest, @Body() writeHelpDto: WriteHelpDto): Promise<Help> {
    return await this.helpService.writeHelp(writeHelpDto, req.user);
  }
}
