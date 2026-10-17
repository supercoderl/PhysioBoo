import { ArticleCategory } from "../enums/article";

/** Article as GET /api/articles/{id} returns it (ArticleViewModel). Content is plain text. */
export interface PublicArticle {
    id: string;
    title: string;
    slug: string;
    category: ArticleCategory;
    /** Comma-separated. */
    tags: string | null;
    coverImageUrl: string | null;
    excerpt: string;
    content: string;
    /** Free text: a name only, with no profile. */
    author: string;
    publishDate: string | null;
    /** Stored text, e.g. "8 min read". */
    readTime: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface PublicArticleFilter {
    start: string;
    end: string;
    category: ArticleCategory | null;
    status: null;
}
