import { Module } from '@nestjs/common';
import { MailingController } from './controllers/mailing.controller';
import { MailingService } from './services/mailing.service';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    RmqModule,
  ],
  controllers: [MailingController],
  providers: [MailingService],
})
export class MailingModule { }
