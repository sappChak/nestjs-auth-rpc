import { Response } from 'express';

export function setRefreshTokenCookie(response: Response, token: string): void {
  const refreshTokenName = process.env.REFRESH_TOKEN_NAME;

  if (!refreshTokenName) {
    throw new Error(
      'REFRESH_TOKEN_NAME is not set in the environment variables.',
    );
  }

  response.cookie(refreshTokenName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // secure cookie in production
    sameSite: 'strict', // helps against CSRF attacks
  });
}
