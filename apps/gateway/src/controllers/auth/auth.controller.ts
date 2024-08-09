import {
  Controller,
  Post,
  Get,
  HttpStatus,
  Body,
  Res,
  UseInterceptors,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '@app/shared/constants/constants';
import { AuthInterceptor } from '../../interceptors/auth.interceptor';
import { AuthCredentialsDto } from '../../dtos/auth-credentials.dto';
import { AuthResponseDto } from '../../dtos/auth-response.dto';
import { ValidateRefreshTokenPipe } from '../../pipes/validate-refresh.pipe';
import { CookieParam } from '../../decorators/cookie-param.decorator';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(AuthInterceptor)
export class AuthController {
  public constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: AuthCredentialsDto, description: 'Login credentials' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful.',
    type: AuthResponseDto,
  })
  public async login(
    @Body() credentials: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    return firstValueFrom(this.authClient.send({ cmd: 'login' }, credentials));
  }

  @Post('register')
  @ApiOperation({ summary: 'Register' })
  @ApiBody({ type: AuthCredentialsDto, description: 'Registration data' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration successful.',
    type: AuthResponseDto,
  })
  public async register(
    @Body() credentials: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    return firstValueFrom(
      this.authClient.send({ cmd: 'register' }, credentials),
    );
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  public async logout(
    @Res({ passthrough: true }) response: Response,
    @CookieParam('refreshToken', new ValidateRefreshTokenPipe())
    refreshToken: string,
  ): Promise<{ message: string }> {
    const message = await firstValueFrom(
      this.authClient.send({ cmd: 'logout' }, refreshToken),
    );
    response.clearCookie('refreshToken');
    return message;
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed.',
    type: AuthResponseDto,
  })
  public async refresh(
    @CookieParam('refreshToken', new ValidateRefreshTokenPipe())
    refreshToken: string,
  ): Promise<AuthResponseDto> {
    return firstValueFrom(
      this.authClient.send({ cmd: 'refresh' }, refreshToken),
    );
  }
}
