import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RmqService } from '@app/shared/rmq/rmq.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AuthModule);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('AUTH'));

  app.startAllMicroservices();
}
bootstrap();
