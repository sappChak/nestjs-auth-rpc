import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import express from 'express';
import { GoogleAuthService } from '../services/google.auth.service';
import { setRefreshTokenCookie } from '../utils/set-cookie.util';

@ApiTags('Google Auth')
@Controller()
export class GoogleAuthController {
  public constructor(private readonly googleAuthService: GoogleAuthService) { }

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
  @ApiResponse({ status: 302, description: 'Redirect to client URL' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth tokens' })
  @ApiResponse({
    status: 401,
    description: 'Google user not found or invalid credentials',
  })
  public async processWebhook(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() response: express.Response,
  ) {
    const oAuthTokens = await this.getOAuthTokens(code);
    const googleUser = await this.getGoogleUser(oAuthTokens);
    const userDto = this.createUserDto(googleUser);
    const result = await this.loginGoogleUser(userDto);

    setRefreshTokenCookie(response, result.refreshToken);
    return response.redirect(process.env.CLIENT_URL);
  }

  private async getOAuthTokens(code: string) {
    const oAuthTokens = await this.googleAuthService.getGoogleOAuthTokens(code);
    if (!oAuthTokens) throw new BadRequestException('Invalid OAuth tokens');
    return oAuthTokens;
  }

  private async getGoogleUser(oAuthTokens: any) {
    const googleUser = await this.googleAuthService.getGoogleUser(
      oAuthTokens.id_token,
      oAuthTokens.access_token,
    );
    if (!googleUser) throw new UnauthorizedException('Google user not found');
    return googleUser;
  }

  private createUserDto(googleUser: any) {
    return {
      name: googleUser.given_name,
      surname: googleUser.family_name,
      email: googleUser.email,
      picture: googleUser.picture,
      password: process.env.GOOGLE_PASSWORD!,
    };
  }

  private async loginGoogleUser(userDto: any) {
    const result = await this.googleAuthService.loginGoogleUser(userDto);
    if (!result) throw new UnauthorizedException('Invalid credentials');
    return result;
  }
}
