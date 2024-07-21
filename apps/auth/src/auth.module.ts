import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { ConfigModule } from '@nestjs/config';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import { TOKEN_SERVICE, USER_SERVICE } from '@app/shared/constants/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./apps/auth/.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    RmqModule.register({
      name: TOKEN_SERVICE,
    }),
    RmqModule.register({
      name: USER_SERVICE,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule { }
