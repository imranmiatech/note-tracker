import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';

export class FilterNotesDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter notes by title (substring match)',
    example: 'meeting',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
