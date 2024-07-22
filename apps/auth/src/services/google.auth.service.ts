import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';
import { stringify } from 'qs';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { TOKEN_SERVICE, USER_SERVICE } from '@app/shared/constants/constants';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { GoogleToken } from '../interfaces/google-token.interface';
import { GoogleUser } from '../interfaces/google-user.interface';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';

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
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    @Inject(TOKEN_SERVICE) private readonly tokenClient: ClientProxy,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
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
    this.googleApiUrl = this.configService.get<string>('GOOGLE_API_URL');
  }

  public async loginGoogleUser(
    createUserDto: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    const user = await lastValueFrom(
      this.userClient.send({ cmd: 'create-user' }, createUserDto),
    );
    return this.authorizeWithGoogle(user);
  }

  public async getGoogleOAuthTokens(code: string) {
    this.logger.debug(`Fetching Google OAuth Tokens with code: ${code}`);

    const googleResponse = await this.postToUrl<GoogleToken>(
      this.googleTokenUrl,
      this.getOAuthValues(code),
    );
    return googleResponse;
  }

  public async getGoogleUser(id_token: string, access_token: string) {
    const response = await this.getGoogleUserInfo(id_token, access_token);
    return response;
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

  private async postToUrl<T>(url: string, values: any) {
    return this.httpService.post<T>(url, stringify(values));
  }

  private async getGoogleUserInfo(id_token: string, access_token: string) {
    return this.httpService.get<GoogleUser>(
      `${this.googleApiUrl}=${access_token}`,
      {
        headers: { Authorization: `Bearer ${id_token}` },
      },
    );
  }
}
