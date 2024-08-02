import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { stringify } from 'qs';
import { firstValueFrom, map } from 'rxjs';
import bcrypt from 'bcrypt';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { GoogleUser } from '../interfaces/google-user.interface';
import { GoogleToken } from '../interfaces/google-token.interface';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly googleRedirectUri: string;
  private readonly googleTokenUrl: string;
  private readonly googleGrantType: string;
  private readonly googleApiUrl: string;

  public constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    )!;
    this.googleRedirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
    )!;
    this.googleTokenUrl = this.configService.get<string>('GOOGLE_TOKEN_URL');
    this.googleGrantType = this.configService.get<string>('GOOGLE_GRANT_TYPE');
    this.googleApiUrl = this.configService.get<string>('GOOGLE_API_URL');
  }

  public async authenticateWithGoogle(
    code: string,
    state: string,
  ): Promise<AuthResponseDto> {
    const oAuthTokens = await this.fetchGoogleOAuthTokens(code);
    const googleUser = await this.fetchGoogleUser(
      oAuthTokens.id_token,
      oAuthTokens.access_token,
    );
    return this.processGoogleUser(googleUser, state);
  }

  private async processGoogleUser(
    googleUser: GoogleUser,
    state: string,
  ): Promise<AuthResponseDto> {
    const hashedPassword = await this.generateRandomPassword();

    const userDto = {
      role: state,
      name: googleUser.given_name,
      surname: googleUser.family_name,
      email: googleUser.email,
      profile_picture: googleUser.picture,
      password: hashedPassword,
    };

    return this.authService.generateAuthResponse(userDto);
  }

  private async fetchGoogleOAuthTokens(code: string): Promise<GoogleToken> {
    this.logger.debug(`Fetching Google OAuth Tokens with code: ${code}`);
    const response = await firstValueFrom(
      this.httpService
        .post<GoogleToken>(
          this.googleTokenUrl,
          stringify(this.getOAuthValues(code)),
        )
        .pipe(map((response: AxiosResponse<GoogleToken>) => response.data)),
    );

    if (!response) {
      throw new BadRequestException('Failed to fetch OAuth tokens');
    }

    this.logger.debug(`Received OAuth tokens: ${JSON.stringify(response)}`);
    return response;
  }

  private async fetchGoogleUser(
    id_token: string,
    access_token: string,
  ): Promise<GoogleUser> {
    this.logger.debug(
      `Fetching Google user info with id_token: ${id_token} and access_token: ${access_token}`,
    );
    const response = await firstValueFrom(
      this.httpService
        .get<GoogleUser>(`${this.googleApiUrl}=${access_token}`, {
          headers: { Authorization: `Bearer ${id_token}` },
        })
        .pipe(map((response: AxiosResponse<GoogleUser>) => response.data)),
    );

    if (!response) {
      throw new UnauthorizedException('Failed to fetch Google user');
    }

    return response;
  }

  private async generateRandomPassword(): Promise<string> {
    const password = Math.random().toString(36).slice(-8);
    return bcrypt.hash(password, 10);
  }

  private getOAuthValues(code: string) {
    return {
      code,
      client_id: this.googleClientId,
      client_secret: this.googleClientSecret,
      redirect_uri: this.googleRedirectUri,
      grant_type: this.googleGrantType,
    };
  }
}
