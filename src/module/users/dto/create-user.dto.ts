import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum.js';

export class CreateUserDto {
  @ApiProperty({
    example: 'Admin Created User',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Role for user (USER or ADMIN)',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be USER or ADMIN' })
  role?: UserRole;

  @ApiPropertyOptional({
    type: [String],
    example: ['chess', 'reading'],
    description: 'Array of user interests',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
