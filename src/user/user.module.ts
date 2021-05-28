import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../common/entity/user.entity';
import { Album } from '../common/entity/album.entity';
import { JwtStrategy } from '../auth/strategy/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
