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
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { NotesService } from '../notes/notes.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UsersService } from './users.service.js';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notesService: NotesService,
  ) {}

  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Own user profile.' })
  @Get('me')
  async getMyProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.findOne(userId);
  }

  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Updated own user profile.' })
  @Patch('me')
  async updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateMeDto: UpdateMeDto,
  ) {
    return this.usersService.updateMe(userId, updateMeDto);
  }

  @ApiOperation({
    summary:
      'Scenario 1 Aggregation: Group users by interests using single aggregate() call',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of interests with grouped users.',
  })
  @Get('analytics/interests')
  async getUsersGroupedByInterestsAnalytics() {
    return this.usersService.getUsersGroupedByInterests();
  }

  @ApiOperation({
    summary:
      'Scenario 1 Aggregation Alias: Group users by interests using single aggregate() call',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of interests with grouped users.',
  })
  @Get('grouped-by-interests')
  async getUsersGroupedByInterests() {
    return this.usersService.getUsersGroupedByInterests();
  }

  @ApiOperation({
    summary: 'List all notes belonging to a specific user (Admin Only)',
  })
  @ApiResponse({ status: 200, description: 'Paginated user notes list.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @Roles(UserRole.ADMIN)
  @Get(':userId/notes')
  async findNotesByUserId(
    @Param('userId') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.notesService.findNotesByUserId(userId, paginationQuery);
  }

  @ApiOperation({
    summary: 'List all users with pagination (Admin Only)',
  })
  @ApiResponse({ status: 200, description: 'Paginated user list.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @ApiOperation({ summary: 'Get user details by ID (Admin Only)' })
  @ApiResponse({ status: 200, description: 'User details object.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new user (Admin Only)' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Update user profile by ID (Admin Only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete user by ID (Admin Only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin role required).' })
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
