import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entity/user.entity';
import { Album } from '../common/entity/album.entity';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { UserInfo } from '../common/view/user-info.entity';
import { UserTagInfo } from '../common/view/user-tag-info.entity';
import { UserFollow } from '../common/entity/user-follow.entity';
import { MusicLike } from '../common/entity/music-like.entity';
import { Music } from '../common/entity/music.entity';
import { MusicModule } from '../music/music.module';
import { SocialLog } from '../common/view/social-log.entity';
import { UserBlock } from '../common/entity/user-block.entity';
import { MusicComment } from '../common/entity/music-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Album,
      UserInfo,
      UserTagInfo,
      UserFollow,
      MusicLike,
      Music,
      SocialLog,
      UserBlock,
      MusicComment
    ]),
    forwardRef(() => MusicModule),
  ],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
