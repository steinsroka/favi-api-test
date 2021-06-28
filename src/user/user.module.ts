import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entity/user.entity';
import { Album } from '../common/entity/album.entity';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { UserInfo } from '../common/view/user-info.entity';
import { UserTagInfo } from '../common/view/user-tag-info.entity';
import { MusicTagInfo } from '../common/view/music-tag-info.entity';
import { MusicLike } from '../common/entity/music-like.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Album, UserInfo, UserTagInfo, MusicLike])],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
