import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import { AUTH_SERVICE } from '@app/shared/constants/constants';
import { AuthController } from './controllers/auth.controller';
import { GoogleAuthController } from './controllers/google.auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./apps/gateway/.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [],
})
export class GatewayModule { }
