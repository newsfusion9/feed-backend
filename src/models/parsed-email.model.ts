import mongoose, { Schema } from "mongoose";
import { IArticle, INewsletter } from "../types/index.types";

const NewsletterSchema = new Schema<INewsletter>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rssUrl: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    email: { type: String },
    newsletterId: { type: Schema.Types.ObjectId, ref: "Newsletter" },
    published: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishUntil: { type: Date },
    externalId: { type: String },
    link: { type: String },
    thumbnailUrl: { type: String },
  },
  { timestamps: true }
);

const Newsletter = mongoose.model<INewsletter>("Newsletter", NewsletterSchema);
const Article = mongoose.model<IArticle>("Article", ArticleSchema);

export { Newsletter, Article, INewsletter, IArticle };
