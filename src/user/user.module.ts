import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Album } from './album/album.entity';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';
import { AlbumModule } from './album/album.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AlbumModule],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
