import { CreateTokenDto } from "../dtos/create-token.dto";

export interface ITokenService {
  /**
   * Generates an access token based on the provided payload.
   * @param payload - An instance of `CreateTokenRequestDto` containing the payload for generating the access token.
   * @returns A promise that resolves to a string representing the generated access token.
   */
  generateAccessToken(payload: CreateTokenDto): Promise<string>;

  /**
   * Generates a refresh token based on the provided payload.
   * @param payload - An instance of `CreateTokenRequestDto` containing the payload for generating the refresh token.
   * @returns A promise that resolves to a string representing the generated refresh token.
   */
  generateRefreshToken(payload: CreateTokenDto): Promise<string>;

  /**
   * Revokes a refresh token.
   * @param refreshToken - A string representing the refresh token to be revoked.
   * @returns A promise that resolves once the refresh token is successfully revoked.
   */
  deleteRefreshToken(refreshToken: string): Promise<void>;

  /**
   * Verifies the validity of an access token.
   * @param token - A string representing the access token to verify.
   * @returns A promise that resolves to an instance of `CreateTokenRequestDto` if the access token is valid.
   * @throws Error if the access token is invalid or expired.
   */
  verifyAccessToken(token: string): Promise<CreateTokenDto>;

  /**
   * Verifies the validity of a refresh token.
   * @param token - A string representing the refresh token to verify.
   * @returns A promise that resolves to an instance of `CreateTokenRequestDto` if the refresh token is valid.
   * @throws Error if the refresh token is invalid or expired.
   */
  verifyRefreshToken(token: string): Promise<CreateTokenDto>;
}
