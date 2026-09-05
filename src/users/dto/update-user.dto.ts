import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum.js';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe Updated',
    description: 'Updated user name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'Updated user email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    example: 'newPassword123',
    description: 'Optional updated password',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'User role (USER or ADMIN)',
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
