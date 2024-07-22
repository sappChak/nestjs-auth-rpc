import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { stringify } from 'qs';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { GoogleToken } from '../interfaces/google-token.interface';
import { GoogleUser } from '../interfaces/google-user.interface';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { TOKEN_SERVICE, USER_SERVICE } from '@app/shared/constants/constants';
import { Nullable } from '@app/shared/types/types';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly googleRedirectUri: string;
  private readonly googleTokenUrl: string;
  private readonly googleGrantType: string;
  private readonly axiosInstance: AxiosInstance;

  public constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    @Inject(TOKEN_SERVICE) private readonly tokenClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClientSecret = this.configService.get<string>(
      'GOOGLE_CLIENT_SECRET',
    );
    this.googleRedirectUri = this.configService.get<string>(
      'GOOGLE_REDIRECT_URI',
    );
    this.googleTokenUrl = this.configService.get<string>('GOOGLE_TOKEN_URL');
    this.googleGrantType = this.configService.get<string>('GOOGLE_GRANT_TYPE');
    this.axiosInstance = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  public async loginGoogleUser(
    createUserDto: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    const user = await lastValueFrom(
      this.userClient.send({ cmd: 'create-user' }, createUserDto),
    );
    return this.authorizeWithGoogle(user);
  }

  public async getGoogleOAuthTokens(
    code: string,
  ): Promise<Nullable<GoogleToken>> {
    this.logger.debug(`Fetching Google OAuth Tokens with code: ${code}`);

    const googleResponse = await this.postToUrl<GoogleToken>(
      this.googleTokenUrl,
      this.getOAuthValues(code),
    );
    return googleResponse.data;
  }

  public async getGoogleUser(
    id_token: string,
    access_token: string,
  ): Promise<Nullable<GoogleUser>> {
    const response = await this.getGoogleUserInfo(id_token, access_token);
    return response.data;
  }

  private async authorizeWithGoogle(user: any): Promise<AuthResponseDto> {
    const { accessToken, refreshToken } = await firstValueFrom(
      this.tokenClient.send({ cmd: 'generate-tokens' }, user),
    );
    return { accessToken, refreshToken, user };
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

  private async postToUrl<T>(
    url: string,
    values: any,
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, stringify(values));
  }

  private async getGoogleUserInfo(id_token: string, access_token: string) {
    return axios.get<GoogleUser>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: { Authorization: `Bearer ${id_token}` },
      },
    );
  }
}
