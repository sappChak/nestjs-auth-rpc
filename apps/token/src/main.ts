import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RmqService } from '@app/shared/rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';
import { TokenModule } from './token.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(TokenModule);
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('TOKEN'));
  app.startAllMicroservices();
}
bootstrap();
