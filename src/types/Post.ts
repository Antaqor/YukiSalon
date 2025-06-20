export interface Post {
  _id: string;
  title?: string;
  content: string;
  createdAt: string;
  sharedFrom?: Post;
  image?: string;
  images?: string[];
  likes?: (string | any)[];
  comments?: any[];
  shares?: number;
  user?: any;
}
