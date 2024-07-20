import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TOKEN_SERVICE, USER_SERVICE } from '../constants/constants';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  public constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenClient: ClientProxy,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {
    console.log(tokenClient, userClient);
  }

  public async login(
    credentials: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    const user = await this.validateUser(credentials);
    return this.generateAuthResponse(user);
  }

  public async register(
    credentials: AuthCredentialsDto,
  ): Promise<AuthResponseDto> {
    const existingUser = await firstValueFrom(
      this.userClient.send('get-user-by-email', { email: credentials.email }),
    );

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const encryptedPassword = await bcrypt.hash(credentials.password, 10);

    const user = await firstValueFrom(
      this.userClient.send('create-user', {
        ...credentials,
        password: encryptedPassword,
      }),
    );

    const { password, ...userWithoutPassword } = user;

    return this.generateAuthResponse(userWithoutPassword);
  }

  public async refresh(token: string): Promise<AuthResponseDto> {
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    const userPayload = await firstValueFrom(
      this.tokenClient.send('verify-refresh-token', token),
    );

    if (!userPayload) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.generateAuthResponse(userPayload);
  }

  public async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('Token not provided');
    }
    await firstValueFrom(
      this.tokenClient.send('delete-refresh-token', refreshToken),
    );
  }

  private async generateAuthResponse(user: any) {
    const { accessToken, refreshToken } = await firstValueFrom(
      this.tokenClient.send('user-created', user),
    );

    return { accessToken, refreshToken, user };
  }

  private async validateUser(credentials: AuthCredentialsDto) {
    const user = await firstValueFrom(
      this.userClient.send('get-user-by-email', { email: credentials.email }),
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
