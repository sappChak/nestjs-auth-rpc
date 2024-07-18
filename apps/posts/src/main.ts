import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RmqService } from '@app/shared/rmq/rmq.service';
import { PostsModule } from './posts.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(PostsModule);

  const rmqService = app.get<RmqService>(RmqService);

  app.connectMicroservice<MicroserviceOptions>(rmqService.getOptions('POSTS'));
  app.startAllMicroservices();
}
bootstrap();
