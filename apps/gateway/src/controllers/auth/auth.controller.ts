import {
  Controller,
  Post,
  Get,
  HttpStatus,
  Body,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthInterceptor } from '../../interceptors/auth.interceptor';
import { AuthCredentialsDto } from '../../dtos/auth-credentials.dto';
import { AuthResponseDto } from '../../dtos/auth-response.dto';
import { ValidateRefreshTokenPipe } from '../../pipes/validate-refresh.pipe';
import { CookieParam } from '../../decorators/cookie-param.decorator';
import { AuthService } from '../../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(AuthInterceptor)
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

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
    return this.authService.login(credentials);
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
    return this.authService.register(credentials);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout' })
  public async logout(
    @Res({ passthrough: true }) response: Response,
    @CookieParam('refreshToken', new ValidateRefreshTokenPipe())
    refreshToken: string,
  ): Promise<{ message: string }> {
    await this.authService.logout(refreshToken);
    response.clearCookie('refreshToken');
    return { message: 'xui' };
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
    return this.authService.refresh(refreshToken);
  }
}
