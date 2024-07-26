import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsEmail, IsString } from 'class-validator';

@Exclude()
export class CreateTokenDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user.',
  })
  @IsInt({ message: 'ID must be an integer' })
  @Expose()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  surname: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user.',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Expose()
  email: string;
}
