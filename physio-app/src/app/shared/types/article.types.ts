import { ArticleCategory, ArticleStatus } from "../enums/article";

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  tags: string;
  coverImageUrl: string;
  excerpt: string;
  content: string;
  author: string;
  status: ArticleStatus;
  publishDate: string | null;
  readTime: string;
  createdAt: string;
  updatedAt: string;
}
