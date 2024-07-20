import { Controller, Logger } from '@nestjs/common';
import {
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { TokenService } from '../services/token.service';
import { CreateTokenDto } from '../dto/create-tokens.dto';

@Controller()
export class TokenController {
  private readonly logger = new Logger(TokenController.name);

  public constructor(private readonly tokenService: TokenService) { }

  @MessagePattern('generate-access-token')
  public async handleAccessTokenGeneration(
    @Payload() data: CreateTokenDto,
    @Ctx() context: RmqContext,
  ) {
    return this.handleTokenGeneration(
      data,
      context,
      this.tokenService.generateAccessToken,
    );
  }

  @MessagePattern('generate-refresh-token')
  public async handleRefreshTokenGeneration(
    @Payload() data: CreateTokenDto,
    @Ctx() context: RmqContext,
  ) {
    return this.handleTokenGeneration(
      data,
      context,
      this.tokenService.generateRefreshToken,
    );
  }

  @MessagePattern('user-created')
  public async handleUserCreated(
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

      this.logger.debug(`Generated tokens for user with id: ${data.id}`);

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

  private async handleTokenGeneration(
    data: CreateTokenDto,
    context: RmqContext,
    tokenGenerationMethod: (data: CreateTokenDto) => Promise<string>,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.debug(
        `Token generation event received: ${JSON.stringify(data)}`,
      );

      const token = await tokenGenerationMethod(data);

      this.logger.debug(`Generated token for user with id: ${data.id}`);

      channel.ack(originalMsg);

      return token;
    } catch (error) {
      channel.nack(originalMsg);
    }
  }
}
