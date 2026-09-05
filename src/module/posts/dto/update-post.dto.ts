import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @ApiPropertyOptional({
    example: 'Updated Post Title',
    description: 'Updated title of the post',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated body content of the post...',
    description: 'Updated body content of the post',
  })
  @IsOptional()
  @IsString()
  body?: string;
}
