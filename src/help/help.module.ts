import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Help } from '../common/entity/help.entity';
import { User } from '../common/entity/user.entity';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';

@Module({
  imports: [TypeOrmModule.forFeature([Help, User])],
  controllers: [HelpController],
  providers: [HelpService],
  exports: [HelpService],
})
export class HelpModule {}
