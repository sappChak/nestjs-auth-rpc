import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { setRefreshTokenCookie } from '../../utils/set-cookie.util';
import { GoogleAuthService } from '../../services/google.auth.service';

@ApiTags('Google Auth')
@Controller()
export class GoogleAuthController {
  private readonly clientUrl: string;

  public constructor(
    private readonly googleAuthService: GoogleAuthService,
    private readonly configService: ConfigService,
  ) {
    this.clientUrl = this.configService.get('CLIENT_URL');
  }

  @Get('tokens/oauth/google')
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
  public async handleGoogleAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: Response,
  ) {
    const result = await this.googleAuthService.authenticateWithGoogle(
      code,
      state,
    );
    setRefreshTokenCookie(response, result.refreshToken);
    return response.redirect(this.clientUrl);
  }
}
