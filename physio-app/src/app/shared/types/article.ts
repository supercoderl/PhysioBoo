export interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: string;
  featured?: boolean;
}