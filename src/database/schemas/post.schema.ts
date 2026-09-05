import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  body: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Explicit schema.index method definitions as required by review guidelines
// Compound index supporting $lookup aggregation joining posts by userId and pagination sorting
PostSchema.index({ userId: 1, createdAt: -1 });
// Index supporting general post listing pagination
PostSchema.index({ createdAt: -1 });
