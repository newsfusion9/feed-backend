export interface INewsletter extends Document {
  name: string;
  email: string;
  rssUrl?: string;
  active: boolean;
}
