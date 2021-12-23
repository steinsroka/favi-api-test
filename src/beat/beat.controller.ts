import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  forwardRef,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Message } from '../common/class/message';
import { UserRequest } from '../common/@types/user-request';

import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { TestUserGuard } from '../user/guard/test-user.guard';
import { GuestableAuthGuard } from '../auth/guard/guestable-auth.guard';
import { Beat } from '../common/entity/beat.entity';
import { ValidateBeatPipe } from './pipe/validate-beat.pipe';
import { BeatInfo } from '../common/view/beat-info.entity';
// import { GetHelpDto } from './dto/get-help.dto';
// import { WriteHelpDto } from './dto/write-help.dto';
import { AddBeatDto } from './dto/add-beat.dto';
import { BeatSmallInfoDto } from './dto/beat-small-info.dto';
import { EditBeatDto } from './dto/edit-beat.dto';
import { BeatService } from './beat.service';
import { InsertResult } from 'typeorm';
import { isDefined } from 'class-validator';
import { ErrorMessage } from '../common/class/error-message';
import { ErrorString } from '../common/const/error-string';
import { UserService } from '../user/user.service';

@Controller('beat')
@UseGuards(JwtAuthGuard)
@UsePipes(ValidateBeatPipe)
// @UseGuards(GuestableAuthGuard)
export class BeatController {
  constructor(
    private readonly beatService: BeatService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  @Post()
  @HttpCode(204)
  async addBeat(
    @Request() req: UserRequest,
    // @Param('id') id: number,
    @Body() addBeatDto: AddBeatDto,
  ): Promise<Message> {
    await this.beatService.addBeat(
      req.user,
      addBeatDto
    );

    return new Message('success');
  }


  @Get(':id')
  async getBeatInfo(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<BeatInfo> {
    const beat = await this.beatService.getBeat(id, req.user);
    return beat;
  }

  @Patch(':id')
  @UseGuards(TestUserGuard)
  async editBeat(
    @Req() req: UserRequest,
    @Param('id') id: number,
    @Body() editBeatDto: EditBeatDto,
  ) {
    // if (!(await this.userService.isExistTesterMusic(req.user, id))) {
    //   throw new ForbiddenException();
    // }
    const result = await this.beatService.editBeat(id, editBeatDto);
    // await this.userService.deleteTesterMusic(req.user, id);
    return result;
  }

  @Put(':id/like')
  @HttpCode(204)
  async likeBeat(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.beatService.addBeatLike(id, req.user);
  }

  @Delete(':id/like')
  @HttpCode(204)
  async hateBeat(
    @Request() req: UserRequest,
    @Param('id') id: number,
  ): Promise<void> {
    await this.beatService.deleteBeatLike(id, req.user);
  }
  //
  // @Get()
  // async getHelps(@Request() req: UserRequest, @Query() getHelpDto: GetHelpDto): Promise<Help[]> {
  //   console.log(typeof getHelpDto.index);
  //   return await this.helpService.getHelps(getHelpDto.index, getHelpDto.size, req.user.id);
  // }
  //
  // @Post()
  // async writeHelp(@Request() req: UserRequest, @Body() writeHelpDto: WriteHelpDto): Promise<Help> {
  //   return await this.helpService.writeHelp(writeHelpDto, req.user);
  // }
}
