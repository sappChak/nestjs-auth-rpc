import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  @IsString()
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: 'example@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '!Password123$', description: 'User password' })
  @IsStrongPassword()
  password: string;
}
