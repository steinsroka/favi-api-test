import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserAlbum } from './userAlbum.entity';
import { JwtStrategy } from 'src/auth/strategy/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAlbum])],
  providers: [UserService, JwtStrategy],
  controllers: [UserController],
  exports: [TypeOrmModule, UserService],
})
export class UserModule {}
