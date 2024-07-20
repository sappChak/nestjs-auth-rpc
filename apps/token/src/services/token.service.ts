import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Nullable } from '@app/shared/types/types';
import { ITokenService } from '../interfaces/token.service.interface';
import { RefreshToken } from '../entities/token.entity';
import { CreateTokenDto } from '../dto/create-tokens.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TokenService implements ITokenService {
  private readonly jwtAccessOptions: JwtSignOptions;
  private readonly jwtRefreshOptions: JwtSignOptions;
  private readonly jwtAccessVerifyOptions: JwtVerifyOptions;
  private readonly jwtRefreshVerifyOptions: JwtVerifyOptions;

  private readonly logger = new Logger(TokenService.name);

  public constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
  ) {
    this.jwtAccessOptions = {
      secret: this.configService.get<string>('ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_EXPIRATION_TIME'),
    };
    this.jwtRefreshOptions = {
      secret: this.configService.get<string>('REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_EXPIRATION_TIME'),
    };
    this.jwtAccessVerifyOptions = {
      secret: this.configService.get<string>('ACCESS_SECRET'),
    };
    this.jwtRefreshVerifyOptions = {
      secret: this.configService.get<string>('REFRESH_SECRET'),
    };
  }

  public async generateAccessToken(
    payload: CreateTokenDto,
  ): Promise<string> {
    this.logger.debug(
      `Generating access token for user with id: ${payload.id}`,
    );
    return this.jwtService.sign({ ...payload }, this.jwtAccessOptions);
  }

  public async generateRefreshToken(
    payload: CreateTokenDto,
  ): Promise<string> {
    this.logger.debug(
      `Generating refresh token for user with id: ${payload.id}`,
    );
    const refreshToken = this.jwtService.sign(
      { ...payload },
      this.jwtRefreshOptions,
    );
    return await this.saveOrUpdateRefreshToken(payload.id, refreshToken);
  }

  public async revokeRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.tokenRepository.delete({ refresh_token: refreshToken });
      this.logger.debug(`Revoked refresh token: ${refreshToken}`);
    } catch (error) {
      this.logger.error('Failed to revoke refresh token', error.stack);
      throw new BadRequestException('Failed to revoke refresh token');
    }
  }

  public async verifyAccessToken(
    token: string,
  ): Promise<CreateTokenDto> {
    try {
      const payload = this.jwtService.verify(
        token,
        this.jwtAccessVerifyOptions,
      );
      this.logger.debug(
        `Access token verified for payload: ${JSON.stringify(payload)}`,
      );
      return plainToInstance(CreateTokenDto, payload);
    } catch (error) {
      this.logger.error('Failed to verify access token', error.stack);
      throw new BadRequestException('Invalid access token');
    }
  }

  public async verifyRefreshToken(
    token: string,
  ): Promise<CreateTokenDto> {
    const storedToken = await this.findRefreshToken(token);
    if (!storedToken) {
      this.logger.warn('Refresh token not found');
      throw new BadRequestException('Token not found');
    }
    try {
      const payload = this.jwtService.verify(
        token,
        this.jwtRefreshVerifyOptions,
      );
      this.logger.debug(
        `Refresh token verified for payload: ${JSON.stringify(payload)}`,
      );
      return plainToInstance(CreateTokenDto, payload);
    } catch (error) {
      this.logger.error('Failed to verify refresh token', error.stack);
      throw new BadRequestException('Invalid refresh token');
    }
  }

  private async findRefreshToken(
    token: string,
  ): Promise<Nullable<RefreshToken>> {
    return this.tokenRepository.findOne({ where: { refresh_token: token } });
  }

  private async saveOrUpdateRefreshToken(
    userId: number,
    token: string,
  ): Promise<string> {
    let existingToken = await this.tokenRepository.findOneBy({
      user_id: userId,
    });
    if (existingToken) {
      existingToken.refresh_token = token;
      this.logger.debug(`Updating refresh token for user with id: ${userId}`);
    } else {
      this.logger.debug(`Creating refresh token for user with id: ${userId}`);
      existingToken = this.tokenRepository.create({
        user_id: userId,
        refresh_token: token,
      });
    }
    await this.tokenRepository.save(existingToken);
    this.logger.debug(
      `Saved refresh token for user with id: ${userId}, token: ${JSON.stringify(existingToken)}`,
    );
    return existingToken.refresh_token;
  }
}
