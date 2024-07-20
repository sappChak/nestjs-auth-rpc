import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const typeormOptions =
          configService.get<TypeOrmModuleOptions>('typeorm');
        if (!typeormOptions) throw new Error('TypeORM configuration not found');
        return typeormOptions;
      },
    }),
  ],
})
export class DatabaseModule { }
