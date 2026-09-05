import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '482910',
    description: '6-digit numeric OTP received via email',
  })
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value).trim() : ''))
  @IsNotEmpty({ message: 'OTP is required' })
  @IsString({ message: 'OTP must be a valid 6-digit code' })
  otp: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}
