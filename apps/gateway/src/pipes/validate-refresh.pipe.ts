import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ValidateRefreshTokenPipe implements PipeTransform {
  transform(refreshToken: any) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is missing');
    }

    const tokenRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    if (!tokenRegex.test(refreshToken)) {
      throw new BadRequestException('Invalid refresh token format');
    }

    return refreshToken;
  }
}
