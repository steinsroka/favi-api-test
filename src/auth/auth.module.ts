import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthConfig } from '../config/configInterface';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ExistUserIdPipe } from './pipe/exist-user-id.pipe';
import { GuestStrategy } from './strategy/guest.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<AuthConfig>('auth').jwtSecret, // 토큰을 만들때 사용하는 Secret텍스트
          signOptions: { expiresIn: '30d' }, // 30일 이후 더이상 토큰이 유효하지 않음
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GuestStrategy],
  exports: [AuthService], // 다른곳에서도 사용가능하도록
})
export class AuthModule {}
