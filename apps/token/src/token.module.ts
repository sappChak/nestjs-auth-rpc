import { Module } from '@nestjs/common';
import { TokenController } from './controllers/token.controller';
import { TokenService } from './services/token.service';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/token.entity';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@app/shared/database/database.module';
import { RmqModule } from '@app/shared/rmq/rmq.module';
import typeormConfig from './config/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `./apps/token/.${process.env.NODE_ENV}.env`,
      isGlobal: true,
      load: [typeormConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([RefreshToken]),
    RmqModule,
  ],
  controllers: [TokenController],
  providers: [TokenService, JwtService],
})
export class TokenModule {}
