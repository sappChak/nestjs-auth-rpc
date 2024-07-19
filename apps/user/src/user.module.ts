import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { User } from './entities/user.entity';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import typeormConfig from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load: [typeormConfig],
    }),
    DatabaseModule,
    RmqModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
