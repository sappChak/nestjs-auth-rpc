import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { GatewayModule } from './gateway.module';
import { setupMiddlewares } from './config/middlewares';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);
  const port = app.get(ConfigService).get('PORT');
  setupMiddlewares(app);
  await app.listen(port);
}
bootstrap();
