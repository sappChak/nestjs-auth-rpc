import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { Nullable } from '@app/shared/types/types';
import { ITokenService } from '../interfaces/token.service.interface';
import { RefreshToken } from '../entities/token.entity';
import { CreateTokenDto } from '../dtos/create-token.dto';

@Injectable()
export class TokenService implements ITokenService {
  private readonly jwtAccessOptions: JwtSignOptions;
  private readonly jwtRefreshOptions: JwtSignOptions;
  private readonly jwtAccessVerifyOptions: JwtVerifyOptions;
  private readonly jwtRefreshVerifyOptions: JwtVerifyOptions;

  private readonly logger = new Logger(TokenService.name);

  public constructor(
    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
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

  public async generateAccessToken(payload: CreateTokenDto): Promise<string> {
    const token = this.jwtService.sign({ ...payload }, this.jwtAccessOptions);
    this.logger.debug(`Generated access token for user with id: ${payload.id}`);
    return token;
  }

  public async generateRefreshToken(payload: CreateTokenDto): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { ...payload },
      this.jwtRefreshOptions,
    );
    this.logger.debug(
      `Generated refresh token for user with id: ${payload.id}`,
    );
    return this.createOrUpdateRefreshToken(payload.id, refreshToken);
  }

  public async deleteRefreshToken(refreshToken: string): Promise<void> {
    const token = await this.tokenRepository.findOneBy({
      refresh_token: refreshToken,
    });
    await this.tokenRepository.delete({ refresh_token: refreshToken });
    this.logger.debug(
      `Deleted refresh token for user with id: ${token.user_id}`,
    );
  }

  public async verifyAccessToken(accessToken: string): Promise<CreateTokenDto> {
    const payload = this.jwtService.verify(
      accessToken,
      this.jwtAccessVerifyOptions,
    );
    this.logger.debug(
      `Access token verified for payload: ${JSON.stringify(payload)}`,
    );
    return plainToInstance(CreateTokenDto, payload);
  }

  public async verifyRefreshToken(
    refreshToken: string,
  ): Promise<CreateTokenDto> {
    const storedToken = await this.findRefreshToken(refreshToken);

    if (!storedToken) {
      throw new BadRequestException('Token not found');
    }

    const payload = this.jwtService.verify(
      refreshToken,
      this.jwtRefreshVerifyOptions,
    );
    this.logger.debug(`Refresh token verified for user with id: ${payload.id}`);
    return plainToInstance(CreateTokenDto, payload);
  }

  private async findRefreshToken(
    refreshToken: string,
  ): Promise<Nullable<RefreshToken>> {
    return this.tokenRepository.findOne({
      where: { refresh_token: refreshToken },
    });
  }

  private async createOrUpdateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<string> {
    let token = await this.tokenRepository.findOneBy({
      user_id: userId,
    });
    if (token) {
      token.refresh_token = refreshToken;
    } else {
      token = this.tokenRepository.create({
        user_id: userId,
        refresh_token: refreshToken,
      });
    }
    await this.tokenRepository.save(token);
    this.logger.debug(`Saved refresh token for user with id: ${userId}`);
    return token.refresh_token;
  }
}
