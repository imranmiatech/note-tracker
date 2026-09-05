import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class FilterAdminNotesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter notes by specific User ID',
    example: '60d5ec49f1b2c811487f342a',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter notes by title (substring match)',
    example: 'project',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
