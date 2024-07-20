import { NestFactory } from '@nestjs/core';
import { UserModule } from './user.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RmqService } from '@app/shared/rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(UserModule);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('USER'));

  app.startAllMicroservices();
}
bootstrap();
