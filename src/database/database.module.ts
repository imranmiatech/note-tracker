import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema.js';
import { Note, NoteSchema } from './schemas/note.schema.js';
import { Post, PostSchema } from './schemas/post.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Note.name, schema: NoteSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
