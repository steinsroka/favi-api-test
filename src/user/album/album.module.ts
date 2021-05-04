import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { UserService } from '../user.service';
import { AlbumController } from './album.controller';
import { Album } from './album.entity';
import { AlbumService } from './album.service';

@Module({
  imports: [TypeOrmModule.forFeature([Album, User])],
  providers: [AlbumService, UserService],
  controllers: [AlbumController],
  exports: [TypeOrmModule, AlbumService],
})
export class AlbumModule {}
