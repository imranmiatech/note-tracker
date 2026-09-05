import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Note, NoteDocument } from '../../database/schemas/note.schema.js';
import { CreateNoteDto } from './dto/create-note.dto.js';
import { UpdateNoteDto } from './dto/update-note.dto.js';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string) {
    const newNote = await this.noteModel.create({
      title: createNoteDto.title,
      content: createNoteDto.content,
      userId: new mongoose.Types.ObjectId(userId),
    });

    return newNote;
  }

  async findAll(userPayload: any, paginationQuery: PaginationQueryDto) {
    const page = Number(paginationQuery.page ?? 1);
    const limit = Number(paginationQuery.limit ?? 10);
    const skip = (page - 1) * limit;

    // Admin can view everyone's notes; Users can view only their own notes
    const filter =
      userPayload.role === UserRole.ADMIN
        ? {}
        : { userId: new mongoose.Types.ObjectId(userPayload.sub) };

    const [notes, total] = await Promise.all([
      this.noteModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .exec(),
      this.noteModel.countDocuments(filter),
    ]);

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findNotesByUserId(
    targetUserId: string,
    paginationQuery: PaginationQueryDto,
  ) {
    const page = Number(paginationQuery.page ?? 1);
    const limit = Number(paginationQuery.limit ?? 10);
    const skip = (page - 1) * limit;

    const filter = { userId: new mongoose.Types.ObjectId(targetUserId) };

    const [notes, total] = await Promise.all([
      this.noteModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email role')
        .exec(),
      this.noteModel.countDocuments(filter),
    ]);

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userPayload: any) {
    const note = await this.noteModel
      .findById(id)
      .populate('userId', 'name email role')
      .exec();

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    // Check ownership unless requester is Admin
    if (
      userPayload.role !== UserRole.ADMIN &&
      note.userId._id.toString() !== userPayload.sub
    ) {
      throw new ForbiddenException('Access denied: You can only view your own notes');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userPayload: any) {
    const note = await this.noteModel.findById(id);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (
      userPayload.role !== UserRole.ADMIN &&
      note.userId.toString() !== userPayload.sub
    ) {
      throw new ForbiddenException(
        'Access denied: You can only update your own notes',
      );
    }

    if (updateNoteDto.title) {
      note.title = updateNoteDto.title;
    }
    if (updateNoteDto.content) {
      note.content = updateNoteDto.content;
    }

    await note.save();
    return note;
  }

  async remove(id: string, userPayload: any) {
    const note = await this.noteModel.findById(id);

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (
      userPayload.role !== UserRole.ADMIN &&
      note.userId.toString() !== userPayload.sub
    ) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own notes',
      );
    }

    await this.noteModel.findByIdAndDelete(id);
    return { message: 'Note deleted successfully' };
  }
}
