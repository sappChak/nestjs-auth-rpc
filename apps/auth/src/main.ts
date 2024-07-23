import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/shared/rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('AUTH'));
  await app.startAllMicroservices();
}
bootstrap();
