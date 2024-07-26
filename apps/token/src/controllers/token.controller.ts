import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { RmqInterceptor } from '@app/shared/interceptors/rmq.interceptor';
import { TokenService } from '../services/token.service';
import { CreateTokenDto } from '../dtos/create-token.dto';

@Controller()
@UseInterceptors(RmqInterceptor)
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

  @EventPattern('refresh-token-revoked')
  public async handleRefreshTokenRevoking(@Payload() refreshToken: string) {
    await this.tokenService.deleteRefreshToken(refreshToken);
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
