import {
  Controller,
  Get,
  Inject,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import express from 'express';
import { AUTH_SERVICE } from '@app/shared/constants/constants';
import { setRefreshTokenCookie } from '../utils/set-cookie.util';

@ApiTags('Google Auth')
@Controller()
export class GoogleAuthController {
  public constructor(
    @Inject(AUTH_SERVICE) private readonly googleAuthClient: ClientProxy,
  ) { }

  @Get('/tokens/oauth/google')
  @ApiOperation({ summary: 'Google OAuth Callback' })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'OAuth authorization code',
  })
  @ApiQuery({
    name: 'state',
    required: true,
    description:
      'State parameter to maintain state between the request and callback. Used to store user role.',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirect to client URL',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid OAuth tokens',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Google user not found or invalid credentials',
  })
  public async processWebhook(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: express.Response,
  ) {
    const result = await firstValueFrom(
      this.googleAuthClient.send({ cmd: 'login-with-google' }, { code, state }),
    );
    setRefreshTokenCookie(response, result.refreshToken);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    return response.redirect(clientUrl);
  }
}
