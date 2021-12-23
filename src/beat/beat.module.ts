import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Beat } from '../common/entity/beat.entity';
import { BeatLike } from '../common/entity/beat-like.entity';
import { BeatController } from './beat.controller';
import { BeatService } from './beat.service';
import { BeatInfo } from '../common/view/beat-info.entity';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beat,
      BeatInfo,
      BeatLike
  ]),
  forwardRef(() => UserModule),
],
  controllers: [BeatController],
  providers: [BeatService],
  exports: [TypeOrmModule,BeatService],
})
export class BeatModule {}
