import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { RmqService } from '@app/shared/rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';
import { setupMiddlewares } from './config/middlewares';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  const configService = app.get(ConfigService);
  setupMiddlewares(app);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('AUTH'));
  await app.startAllMicroservices();

  await app.listen(configService.get<number>('PORT'));
}
bootstrap();
