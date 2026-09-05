import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { Post, PostDocument } from '../database/schemas/post.schema.js';
import { UserRole } from '../common/enums/user-role.enum.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string) {
    const newPost = await this.postModel.create({
      title: createPostDto.title,
      body: createPostDto.body,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return newPost;
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page ?? 1);
    const limit = Number(paginationQuery.limit ?? 10);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.postModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'email role')
        .exec(),
      this.postModel.countDocuments(),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Scenario 2: User Posts ($lookup)
  // Constraint: Single aggregation pipeline with a $lookup stage
  async getUserPostsWithLookup(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await this.postModel.aggregate([
      { $match: { userId: userObjectId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: '$author' },
      {
        $project: {
          _id: 1,
          title: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          'author._id': 1,
          'author.email': 1,
          'author.role': 1,
          'author.interests': 1,
        },
      },
    ]);

    return result;
  }

  async findOne(id: string) {
    const post = await this.postModel
      .findById(id)
      .populate('userId', 'email role')
      .exec();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userPayload: any) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (
      userPayload.role !== UserRole.ADMIN &&
      post.userId.toString() !== userPayload.sub
    ) {
      throw new ForbiddenException(
        'Access denied: You can only update your own posts',
      );
    }

    if (updatePostDto.title) {
      post.title = updatePostDto.title;
    }
    if (updatePostDto.body) {
      post.body = updatePostDto.body;
    }

    await post.save();
    return post;
  }

  async remove(id: string, userPayload: any) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (
      userPayload.role !== UserRole.ADMIN &&
      post.userId.toString() !== userPayload.sub
    ) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own posts',
      );
    }

    await this.postModel.findByIdAndDelete(id);
    return { message: 'Post deleted successfully' };
  }
}
