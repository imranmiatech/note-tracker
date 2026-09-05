import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token issued during login/register',
  })
  @IsString()
  @MinLength(1, { message: 'Refresh token is required' })
  refreshToken: string;
}
