import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import { HttpModule } from '@nestjs/axios';
import { TOKEN_SERVICE, USER_SERVICE } from '@app/shared/constants/constants';
import { AuthController } from './controllers/auth/auth.controller';
import { GoogleAuthController } from './controllers/auth/google.auth.controller';
import { UserController } from './controllers/user/user.controller';
import { AuthService } from './services/auth.service';
import { GoogleAuthService } from './services/google.auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./apps/gateway/.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    HttpModule,
    RmqModule.register({
      name: TOKEN_SERVICE,
    }),
    RmqModule.register({
      name: USER_SERVICE,
    }),
  ],
  controllers: [UserController, AuthController, GoogleAuthController],
  providers: [AuthService, GoogleAuthService],
})
export class GatewayModule {}
