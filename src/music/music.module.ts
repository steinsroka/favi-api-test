import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Music } from './music.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Music])],
  exports: [TypeOrmModule],
})
export class MusicModule {}
