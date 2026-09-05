import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { User, UserDocument } from '../../database/schemas/user.schema.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) { }

  async findAll(paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page ?? 1);
    const limit = Number(paginationQuery.limit ?? 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select(
          '-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpires',
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Aggregate users grouped by interest
  async getUsersGroupedByInterests() {
    return this.userModel.aggregate([
      { $unwind: '$interests' },
      {
        $group: {
          _id: '$interests',
          totalUsers: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email',
              role: '$role',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async findOne(id: string) {
    const user = await this.userModel
      .findById(id)
      .select(
        '-password -refreshToken -resetPasswordOtp -resetPasswordOtpExpires',
      )
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateMe(userId: string, updateMeDto: UpdateMeDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Authenticated user not found');
    }

    if (updateMeDto.name) {
      user.name = updateMeDto.name;
    }

    if (updateMeDto.interests) {
      user.interests = updateMeDto.interests;
    }

    return user.save();
  }

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email.toLowerCase(),
      password: hashedPassword,
      role: createUserDto.role,
      interests: createUserDto.interests ?? [],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (
      updateUserDto.email &&
      updateUserDto.email.toLowerCase() !== user.email
    ) {
      const existing = await this.userModel.findOne({
        email: updateUserDto.email.toLowerCase(),
      });
      if (existing) {
        throw new ConflictException('Email address is already in use');
      }
      user.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    if (updateUserDto.interests) {
      user.interests = updateUserDto.interests;
    }

    return user.save();
  }

  async remove(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { message: 'User deleted successfully' };
  }
}
