/** Ported from physio-app's article.types.ts. */

export type ArticleCategory = number;
export type ArticleStatus = number;

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

export interface ArticleFilter {
    start?: string;
    end?: string;
    category?: number | null;
    status?: number | null;
}
