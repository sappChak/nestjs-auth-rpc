import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import bcrypt from 'bcrypt';
import { TOKEN_SERVICE, USER_SERVICE } from '@app/shared/constants/constants';
import { AuthCredentialsDto } from '../dtos/auth-credentials.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

@Injectable()
export class AuthService {
  public constructor(
    @Inject(TOKEN_SERVICE) private readonly tokenClient: ClientProxy,
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
  ) {}

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
      this.userClient.send({ cmd: 'get-user-by-email' }, credentials.email),
    );

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const encryptedPassword = await bcrypt.hash(credentials.password, 10);

    const user = await firstValueFrom(
      this.userClient.send(
        { cmd: 'create-user' },
        {
          ...credentials,
          password: encryptedPassword,
        },
      ),
    );

    const { password, ...userWithoutPassword } = user;

    return this.generateAuthResponse(userWithoutPassword);
  }

  public async refresh(token: string): Promise<AuthResponseDto> {
    const userPayload = await firstValueFrom(
      this.tokenClient.send({ cmd: 'verify-refresh-token' }, token),
    );

    if (!userPayload) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.generateAuthResponse(userPayload);
  }

  public async logout(refreshToken: string): Promise<void> {
    this.tokenClient.emit('refresh-token-revoked', refreshToken);
  }

  public async generateAuthResponse(user: any): Promise<AuthResponseDto> {
    const { accessToken, refreshToken } = await firstValueFrom(
      this.tokenClient.send({ cmd: 'generate-tokens' }, user),
    );
    return { accessToken, refreshToken, user };
  }

  private async validateUser(credentials: AuthCredentialsDto) {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'get-user-by-email' }, credentials.email),
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
