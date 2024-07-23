import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  Req,
  Res,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { catchError, lastValueFrom, throwError } from 'rxjs';
import { AuthInterceptor } from '../interceptors/auth.interceptor';
import { AuthCredentialsDto } from '../dtos/auth-credentials.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { AUTH_SERVICE } from '@app/shared/constants/constants';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(AuthInterceptor)
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: AuthCredentialsDto, description: 'Login credentials' })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  public async login(
    @Body() credentials: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    return lastValueFrom(this.authClient.send({ cmd: 'login' }, credentials));
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register' })
  @ApiBody({ type: AuthCredentialsDto, description: 'Registration data' })
  @ApiResponse({
    status: 201,
    description: 'Registration successful.',
    type: AuthResponseDto,
  })
  public async register(
    @Body() credentials: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    return await lastValueFrom(
      this.authClient.send({ cmd: 'register' }, credentials),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  public async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await lastValueFrom(
      this.authClient.send({ cmd: 'logout' }, request.cookies.refreshToken),
    );
    response.clearCookie('refreshToken');
  }

  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed.',
    type: AuthResponseDto,
  })
  public async refresh(@Req() request: Request): Promise<AuthResponseDto> {
    return lastValueFrom(
      this.authClient.send({ cmd: 'refresh' }, request.cookies.refreshToken),
    );
  }
}
