import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
  @ApiPropertyOptional({
    example: 'John Doe Updated',
    description: 'Updated full name of user profile',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['reading', 'coding', 'chess'],
    description: 'Updated array of user interests',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];
}
