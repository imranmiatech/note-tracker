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
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostsService } from './posts.service.js';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.postsService.create(createPostDto, userId);
  }

  @ApiOperation({ summary: 'List all posts with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated posts list.' })
  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.postsService.findAll(paginationQuery);
  }

  @ApiOperation({
    summary: 'Retrieve user posts joined with author details ($lookup aggregation)',
  })
  @ApiResponse({
    status: 200,
    description: 'Array of posts joined with author profile.',
  })
  @Get('user/:userId')
  async getUserPostsWithLookup(@Param('userId') userId: string) {
    return this.postsService.getUserPostsWithLookup(userId);
  }

  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post details object.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update post by ID (Author or Admin)' })
  @ApiResponse({ status: 200, description: 'Post updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not post author).' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() userPayload: any,
  ) {
    return this.postsService.update(id, updatePostDto, userPayload);
  }

  @ApiOperation({ summary: 'Delete post by ID (Author or Admin)' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not post author).' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() userPayload: any) {
    return this.postsService.remove(id, userPayload);
  }
}
