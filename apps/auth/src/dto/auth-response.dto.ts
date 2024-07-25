import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken: string;

  refreshToken: string;

  @ApiProperty({ example: { id: 1, email: 'example@example.com' } })
  @Expose()
  user: {
    id: number;
    name: string;
    surname: string;
    email: string;
    profile_picture?: string;
  };
}
