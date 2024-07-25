import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import {
  AUTH_SERVICE,
  TOKEN_SERVICE,
  USER_SERVICE,
} from '@app/shared/constants/constants';
import { AuthController } from './controllers/auth.controller';
import { GoogleAuthController } from './controllers/google.auth.controller';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./apps/gateway/.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    RmqModule.register({
      name: AUTH_SERVICE,
    }),
    RmqModule.register({
      name: TOKEN_SERVICE,
    }),
    RmqModule.register({
      name: USER_SERVICE,
    }),
  ],
  controllers: [UserController, AuthController, GoogleAuthController],
  providers: [],
})
export class GatewayModule { }
