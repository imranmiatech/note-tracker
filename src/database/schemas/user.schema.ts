import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum.js';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ required: false })
  resetPasswordOtp?: string;

  @Prop({ required: false })
  resetPasswordOtpExpires?: Date;

  @Prop({ required: false })
  refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Explicit schema.index method definitions as required by review guidelines
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ interests: 1 });
