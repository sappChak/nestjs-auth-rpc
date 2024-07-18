import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
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
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
