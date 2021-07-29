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
import { Music } from '../common/entity/music.entity';
import { MusicService } from '../music/music.service';
import { MusicModule } from '../music/music.module';
import { SocialLog } from '../common/view/social-log.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Album,
      UserInfo,
      UserTagInfo,
      MusicLike,
      Music,
      SocialLog,
    ]),
    MusicModule,
  ],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
