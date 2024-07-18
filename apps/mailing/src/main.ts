import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RmqService } from '@app/shared/rmq/rmq.service';
import { MicroserviceOptions } from '@nestjs/microservices';
import { MailingModule } from './mailing.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MailingModule);

  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('MAILING'));

  app.startAllMicroservices();
}
bootstrap();
