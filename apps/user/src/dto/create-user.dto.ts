import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'example@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '!Password123$', description: 'User password' })
  @IsStrongPassword()
  password: string;
}
