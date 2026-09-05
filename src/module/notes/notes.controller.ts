import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { FilterNotesDto } from './dto/filter-notes.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';
import { NotesService } from './notes.service.js';

export type NoteQuery = FilterNotesDto & PaginationQueryDto;

@ApiTags('Notes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully.' })
  @Post()
  async create(
    @Body() createNoteDto: CreateNoteDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.notesService.create(createNoteDto, userId);
  }

  @ApiOperation({
    summary:
      'List notes with filters (title, page, limit)',
  })
  @ApiResponse({ status: 200, description: 'Paginated notes list.' })
  @Get()
  async findAll(
    @CurrentUser() userPayload: any,
    @Query() query: FilterNotesDto,
  ) {
    return this.notesService.findAll(userPayload, query);
  }

  @ApiOperation({ summary: 'Get note by ID' })
  @ApiResponse({ status: 200, description: 'Note details object.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not note owner).' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() userPayload: any) {
    return this.notesService.findOne(id, userPayload);
  }

  @ApiOperation({ summary: 'Update note by ID' })
  @ApiResponse({ status: 200, description: 'Note updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not note owner).' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @CurrentUser() userPayload: any,
  ) {
    return this.notesService.update(id, updateNoteDto, userPayload);
  }

  @ApiOperation({ summary: 'Delete note by ID' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not note owner).' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() userPayload: any) {
    return this.notesService.remove(id, userPayload);
  }
}
