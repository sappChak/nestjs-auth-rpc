import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/shared/database/database.module';
import typeormConfig from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/user/.env',
      isGlobal: true,
      load: [typeormConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
    RmqModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
