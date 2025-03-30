import mongoose, { Document } from "mongoose";

export interface IArticle extends Document {
  title: string;
  content: string;
  email?: string;
  newsletterId?: mongoose.Types.ObjectId;
  published?: boolean;
  archived?: boolean;
  publishedAt?: Date;
  publishUntil?: Date;
  externalId?: string;
  link?: string;
  thumbnailUrl?: string;
}
