import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'imran@example.com',
    description: 'User email address to send password reset token',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
