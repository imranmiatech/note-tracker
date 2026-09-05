import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module.js';
import { Note, NoteSchema } from '../database/schemas/note.schema.js';
import { UsersModule } from '../users/users.module.js';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    AuthModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
