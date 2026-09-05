import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { FilterAdminNotesDto } from './dto/filter-admin-notes.dto.js';
import { NotesService } from './notes.service.js';

@ApiTags('Admin Notes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/notes')
export class AdminNotesController {
  constructor(private readonly notesService: NotesService) {}

  @ApiOperation({
    summary:
      'List all notes for admin with filters (userId, title, page, limit) (Admin Only)',
  })
  @ApiResponse({ status: 200, description: 'Paginated notes list for admin.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @Roles(UserRole.ADMIN)
  @Get()
  async findAdminNotes(@Query() query: FilterAdminNotesDto) {
    return this.notesService.findAdminNotes(query);
  }
}
