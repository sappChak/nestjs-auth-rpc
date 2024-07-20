import { Controller, Logger } from '@nestjs/common';
import {
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
  EventPattern,
} from '@nestjs/microservices';
import { TokenService } from '../services/token.service';
import { CreateTokenDto } from '../dto/create-tokens.dto';

@Controller()
export class TokenController {
  private readonly logger = new Logger(TokenController.name);

  public constructor(private readonly tokenService: TokenService) { }

  @MessagePattern({ cmd: 'verify-refresh-token' })
  public async handleRefreshTokenVerification(
    @Payload() token: string,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.debug(`verify-refresh-token event received: ${token}`);

      const user = await this.tokenService.verifyRefreshToken(token);

      channel.ack(originalMsg);

      return user;
    } catch (error) {
      this.logger.error(
        `Failed to verify refresh token: ${token}`,
        error.stack,
      );
      channel.nack(originalMsg);
    }
  }

  @EventPattern('user-logged-out')
  public async handleUserLoggedOut(refreshToken: string) {
    try {
      this.logger.debug(
        `user-logged-out event received: ${JSON.stringify(refreshToken)}`,
      );
      await this.tokenService.revokeRefreshToken(refreshToken);
    } catch (error) {
      this.logger.error(
        `Failed to delete refresh token: ${refreshToken}`,
        error.stack,
      );
    }
  }

  @MessagePattern({ cmd: 'generate-tokens' })
  public async handleTokensGeneration(
    @Payload() data: CreateTokenDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.debug(`user-created event received: ${JSON.stringify(data)}`);

      const [accessToken, refreshToken] = await Promise.all([
        this.tokenService.generateAccessToken(data),
        this.tokenService.generateRefreshToken(data),
      ]);

      channel.ack(originalMsg);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error(
        `Failed to generate tokens for user with id: ${data.id}`,
        error.stack,
      );
      channel.nack(originalMsg);
    }
  }
}
