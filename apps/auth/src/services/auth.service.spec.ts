import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import * as bcrypt from 'bcrypt';
import * as jest from 'jest-mock';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from '../dtos/auth-credentials.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let tokenClient: ClientProxy;
  let userClient: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'TOKEN_SERVICE',
          useValue: {
            send: jest.fn(),
            emit: jest.fn(),
          },
        },
        {
          provide: 'USER_SERVICE',
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    tokenClient = module.get<ClientProxy>('TOKEN_SERVICE');
    userClient = module.get<ClientProxy>('USER_SERVICE');
  });

  describe('login', () => {
    it('should return an AuthResponseDto if credentials are valid', async () => {
      const credentials: AuthCredentialsDto = {
        name: 'Joe',
        surname: 'Doe',
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        name: 'Joe',
        surname: 'Doe',
        email: 'test@example.com',
        profile_picture: 'https://example.com/profile.jpg',
      };
      const authResponse: AuthResponseDto = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user,
      };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      jest
        .spyOn(authService, 'generateAuthResponse')
        .mockResolvedValue(authResponse);

      expect(await authService.login(credentials)).toEqual(authResponse);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const credentials: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest
        .spyOn(authService, 'validateUser')
        .mockRejectedValue(new UnauthorizedException('Invalid password'));

      await expect(authService.login(credentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should return an AuthResponseDto if registration is successful', async () => {
      const credentials: AuthCredentialsDto = {
        name: 'Joe',
        surname: 'Doe',
        email: 'test@example.com',
        password: 'password',
      };
      const user = {
        id: 1,
        name: 'Joe',
        surname: 'Doe',
        email: 'test@example.com',
        profile_picture: 'https://example.com/profile.jpg',
        password: 'hashedpassword',
      };
      const authResponse: AuthResponseDto = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user,
      };

      jest.spyOn(userClient, 'send').mockImplementation((cmd, data) => {
        if (cmd.cmd === 'get-user-by-email') return of(null);
        if (cmd.cmd === 'create-user') return of(user);
      });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
      jest
        .spyOn(authService, 'generateAuthResponse')
        .mockResolvedValue(authResponse);

      expect(await authService.register(credentials)).toEqual(authResponse);
    });

    it('should throw ConflictException if user already exists', async () => {
      const credentials: AuthCredentialsDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const existingUser = {
        id: 1,
        name: 'Joe',
        surname: 'Doe',
        email: 'test@example.com',
        profile_picture: 'https://example.com/profile.jpg',
      };

      jest.spyOn(userClient, 'send').mockImplementation((cmd, data) => {
        if (cmd.cmd === 'get-user-by-email') return of(existingUser);
      });

      await expect(authService.register(credentials)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('refresh', () => {
    it('should return an AuthResponseDto if token is valid', async () => {
      const token = 'validToken';
      const userPayload = {
        id: 1,
        name: 'Joe',
        surname: 'Doe',
        email: 'test@example.com',
        profile_picture: 'https://example.com/profile.jpg',
      };
      const authResponse: AuthResponseDto = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        user: userPayload,
      };

      jest.spyOn(tokenClient, 'send').mockImplementation((cmd, data) => {
        if (cmd.cmd === 'verify-refresh-token') return of(userPayload);
      });
      jest
        .spyOn(authService, 'generateAuthResponse')
        .mockResolvedValue(authResponse);

      expect(await authService.refresh(token)).toEqual(authResponse);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalidToken';

      jest.spyOn(tokenClient, 'send').mockImplementation((cmd, data) => {
        if (cmd.cmd === 'verify-refresh-token') return of(null);
      });

      await expect(authService.refresh(token)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should emit refresh-token-revoked event', async () => {
      const refreshToken = 'refreshToken';

      jest.spyOn(tokenClient, 'emit').mockImplementation(() => of(null));

      await authService.logout(refreshToken);

      expect(tokenClient.emit).toHaveBeenCalledWith(
        'refresh-token-revoked',
        refreshToken,
      );
    });
  });
});
