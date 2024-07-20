import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthModule } from './auth.module';
import { setup } from './config/setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  setup(app);
  await app.listen(3000);
}
bootstrap();
