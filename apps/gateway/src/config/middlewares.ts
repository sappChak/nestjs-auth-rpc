import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import express from 'express';
import { HttpExceptionFilter } from '@app/shared/filters/all-exceptions.filter';

function setupGlobalPrefix(app: INestApplication) {
  app.setGlobalPrefix('api');
}

function enableCors(app: INestApplication) {
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });
}

function setupGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
}

function setupMiddleware(app: INestApplication) {
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookieParser());
}

function setupGlobalInterceptors(app: INestApplication) {
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );
}

function setupGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(new HttpExceptionFilter());
}

function setupSwagger(app: INestApplication) {
  const options = new DocumentBuilder()
    .setTitle('Nest-js Swagger Example API')
    .setDescription('Swagger Example API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);
}

export function setupMiddlewares(app: INestApplication) {
  setupGlobalPrefix(app);
  enableCors(app);
  setupGlobalPipes(app);
  setupMiddleware(app);
  setupGlobalFilters(app);
  setupGlobalInterceptors(app);
  if (process.env.NODE_ENV !== 'production') setupSwagger(app);
}
