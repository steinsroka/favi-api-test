import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entity/user.entity';
import { Album } from '../common/entity/album.entity';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { UserInfo } from '../common/view/user-info.entity';
import { UserTagInfo } from '../common/view/user-tag-info.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Album, UserInfo, UserTagInfo])],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
