import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    example: 'Updated Meeting Notes',
    description: 'Updated title of the note',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated content details for project architecture.',
    description: 'Updated content of the note',
  })
  @IsOptional()
  @IsString()
  content?: string;
}
