import { Module } from '@nestjs/common';
import { PostsController } from './controllers/posts.controller';
import { PostsService } from './services/posts.service';
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
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule { }
