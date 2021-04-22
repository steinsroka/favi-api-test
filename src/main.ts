import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

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
  await app.listen(3000);
}
bootstrap();
