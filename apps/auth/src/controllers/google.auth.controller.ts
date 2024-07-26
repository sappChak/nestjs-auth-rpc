import {
  BadRequestException,
  Controller,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RmqInterceptor } from '@app/shared/interceptors/rmq.interceptor';
import { GoogleAuthService } from '../services/google.auth.service';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Controller()
@UseInterceptors(RmqInterceptor)
export class GoogleAuthController {
  public constructor(private readonly googleAuthService: GoogleAuthService) { }

  @MessagePattern({ cmd: 'login-with-google' })
  public async handleGoogleAuthLogin(
    @Payload() data: { code: string; state: string },
  ) {
    const oAuthTokens = await this.getOAuthTokens(data.code);
    const googleUser = await this.getGoogleUser(oAuthTokens);
    const userDto = this.createUserDto(googleUser);
    return await this.loginGoogleUser(userDto);
  }

  private async getOAuthTokens(code: string) {
    const oAuthTokens = await this.googleAuthService.getGoogleOAuthTokens(code);
    if (!oAuthTokens) throw new BadRequestException('Invalid OAuth tokens');
    return oAuthTokens;
  }

  private async getGoogleUser(oAuthTokens: any) {
    const googleUser = await this.googleAuthService.getGoogleUser(
      oAuthTokens.id_token,
      oAuthTokens.access_token,
    );
    if (!googleUser) throw new UnauthorizedException('Google user not found');
    return googleUser;
  }

  private createUserDto(googleUser: any) {
    return {
      name: googleUser.given_name,
      surname: googleUser.family_name,
      email: googleUser.email,
      picture: googleUser.picture,
      password: process.env.GOOGLE_PASSWORD!,
    };
  }

  private async loginGoogleUser(userDto: any): Promise<AuthResponseDto> {
    const result = await this.googleAuthService.loginGoogleUser(userDto);
    if (!result) throw new UnauthorizedException('Invalid credentials');
    return result;
  }
}
