import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import * as helmet from 'helmet';

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
  app.useGlobalPipes(new ValidationPipe());
  app.use(cors());
  app.use(helmet());
  await app.listen(80);
}
bootstrap();
