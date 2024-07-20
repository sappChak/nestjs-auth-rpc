import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { setupMiddlewares } from './config/middlewares';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  setupMiddlewares(app);
  const configService = app.get(ConfigService);
  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
