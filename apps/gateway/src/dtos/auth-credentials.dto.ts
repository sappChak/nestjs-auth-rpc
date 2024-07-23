import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthCredentialsDto {
  @ApiProperty({ example: 'Andrew' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Konotop' })
  @IsString()
  surname: string;

  @ApiProperty({ example: 'example@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
