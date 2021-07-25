import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { MusicModule } from './music/music.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/exception-filter/all-exceptions.filter';
import { SearchController } from './search/search.controller';
import { SearchService } from './search/search.service';
import { SearchModule } from './search/search.module';
import { HelpController } from './help/help.controller';
import { HelpModule } from './help/help.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return configService.get<TypeOrmModuleOptions>('database');
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      load: [configuration],
      cache: true,
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    MusicModule,
    SearchModule,
    HelpModule,
  ],
  controllers: [AppController, SearchController, HelpController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    SearchService,
  ],
})
export class AppModule {}
