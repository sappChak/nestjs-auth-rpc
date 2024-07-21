import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { Payload, MessagePattern, EventPattern } from '@nestjs/microservices';
import { TokenService } from '../services/token.service';
import { CreateTokenDto } from '../dto/create-tokens.dto';
import { LoggingInterceptor } from '../interceptors/logger.interceptor';
import { RpcExceptionFilter } from '../filters/rpc-exception.filter';

@Controller()
@UseFilters(RpcExceptionFilter)
@UseInterceptors(LoggingInterceptor)
export class TokenController {
  public constructor(private readonly tokenService: TokenService) { }

  @MessagePattern({ cmd: 'verify-refresh-token' })
  public async handleRefreshTokenVerification(@Payload() token: string) {
    return this.tokenService.verifyRefreshToken(token);
  }

  @MessagePattern({ cmd: 'verify-access-token' })
  public async handleAccessTokenVerification(@Payload() token: string) {
    return this.tokenService.verifyAccessToken(token);
  }

  @EventPattern('user-logged-out')
  public async handleUserLoggedOut(@Payload() refreshToken: string) {
    return this.tokenService.revokeRefreshToken(refreshToken);
  }

  @MessagePattern({ cmd: 'generate-tokens' })
  public async handleTokensGeneration(@Payload() data: CreateTokenDto) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(data),
      this.tokenService.generateRefreshToken(data),
    ]);

    return { accessToken, refreshToken };
  }
}
