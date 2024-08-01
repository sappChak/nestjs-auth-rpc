import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GatewayModule } from './gateway.module';
import { setupMiddlewares } from './config/middlewares';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);
  setupMiddlewares(app);
  await app.listen(8080);
}
bootstrap();
