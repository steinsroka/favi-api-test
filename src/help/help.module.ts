import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/common/entity/user.entity';
import { Help } from '../common/entity/help.entity';
import { HelpController } from './help.controller';
import { HelpService } from './help.service';

@Module({
  imports: [TypeOrmModule.forFeature([Help, User])],
  controllers: [HelpController],
  providers: [HelpService],
  exports: [HelpService],
})
export class HelpModule {}
