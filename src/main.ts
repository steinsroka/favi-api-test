import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { HttpConfig } from './config/configInterface';

async function bootstrap() {
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'develop'
  ) {
    console.log(
      'process environment value NODE_ENV should be "production" or "develop"',
    );
    return;
  }
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.use(cors());
  app.use(helmet());
  const configService = app.get(ConfigService);
  const httpConfig = configService.get<HttpConfig>('http');
  await app.listen(httpConfig.port);
}
bootstrap();
