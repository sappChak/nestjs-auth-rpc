import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsEmail, IsNotEmpty } from 'class-validator';

@Exclude()
export class CreateTokenDto {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user.',
  })
  @IsInt({ message: 'ID must be an integer' })
  @IsNotEmpty({ message: 'ID is required' })
  @Expose()
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user.',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Expose()
  email: string;
}
