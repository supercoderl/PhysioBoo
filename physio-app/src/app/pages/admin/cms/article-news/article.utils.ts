import { BooBadgeTone } from '@physioboo/ui';
import { ArticleCategory, ArticleStatus } from '../../../../shared/enums/article';
import { Article } from '../../../../shared/types/article.types';

/** Only Published reads green: it is the one state readers can see. */
export const STATUS: Record<ArticleStatus, { label: string; tone: BooBadgeTone }> = {
    [ArticleStatus.Draft]: { label: 'Draft', tone: 'neutral' },
    [ArticleStatus.Published]: { label: 'Published', tone: 'success' },
    [ArticleStatus.Archived]: { label: 'Archived', tone: 'neutral' },
};

export const CATEGORY_LABEL: Record<ArticleCategory, string> = {
    [ArticleCategory.Medical]: 'Medical',
    [ArticleCategory.Research]: 'Research',
    [ArticleCategory.Technology]: 'Technology',
    [ArticleCategory.Wellness]: 'Wellness',
    [ArticleCategory.Community]: 'Community',
};

export const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABEL) as unknown as ArticleCategory[])
    .map(k => Number(k) as ArticleCategory)
    .map(value => ({ value, label: CATEGORY_LABEL[value] }));

export const STATUS_OPTIONS = [ArticleStatus.Draft, ArticleStatus.Published, ArticleStatus.Archived]
    .map(value => ({ value, label: STATUS[value].label }));

/** The full write body accepted by POST and PATCH /api/articles (PATCH replaces every field). */
export interface ArticleWriteBody {
    title: string;
    slug: string;
    author: string;
    category: ArticleCategory;
    tags: string | null;
    coverImageUrl: string | null;
    excerpt: string;
    content: string;
    status: ArticleStatus;
    publishDate: string | null;
    readTime: string | null;
}

export interface ArticleTransition {
    to: ArticleStatus;
    label: string;
    icon: string;
    /** Changes what the public blog shows, so it is confirmed first. */
    confirm: boolean;
    /** Shown after the change is saved. */
    done: string;
    danger?: boolean;
}

const PUBLISH: ArticleTransition = { to: ArticleStatus.Published, label: 'Publish', icon: 'send', confirm: true, done: 'Article published' };

/** Status moves offered for each status, the usual next step first. The server accepts any status on update. */
const TRANSITIONS: Record<ArticleStatus, ArticleTransition[]> = {
    [ArticleStatus.Draft]: [
        PUBLISH,
        { to: ArticleStatus.Archived, label: 'Archive', icon: 'archive', confirm: false, done: 'Article archived' },
    ],
    [ArticleStatus.Published]: [
        { to: ArticleStatus.Draft, label: 'Unpublish', icon: 'undo-2', confirm: true, done: 'Moved back to draft' },
        { to: ArticleStatus.Archived, label: 'Archive', icon: 'archive', confirm: true, done: 'Article archived', danger: true },
    ],
    [ArticleStatus.Archived]: [
        { to: ArticleStatus.Draft, label: 'Restore as draft', icon: 'archive-restore', confirm: false, done: 'Restored as draft' },
        PUBLISH,
    ],
};

export function statusOf(a: Article): { label: string; tone: BooBadgeTone } {
    return STATUS[a.status] ?? { label: 'Unknown', tone: 'neutral' };
}

export function categoryOf(a: Article): string {
    return CATEGORY_LABEL[a.category] ?? 'Uncategorised';
}

export function transitionsOf(a: Article): ArticleTransition[] {
    return TRANSITIONS[a.status] ?? [];
}

/** Comma-separated tags as a clean list. */
export function tagsOf(a: Pick<Article, 'tags'>): string[] {
    return (a.tags ?? '').split(',').map(t => t.trim()).filter(Boolean);
}

/** Local date as YYYY-MM-DD. */
export function isoDate(d: Date): string {
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Parses YYYY-MM-DD (or the date part of an ISO timestamp) as a local date. */
export function parseIsoDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const [y, m, d] = value.slice(0, 10).split('-').map(Number);
    return y && m && d ? new Date(y, m - 1, d) : null;
}

/**
 * The public blog shows and sorts by the publish date, so a published article always gets one: today, when none
 * was set. A date already chosen is kept.
 */
export function publishDateFor(status: ArticleStatus, publishDate: string | null | undefined): string | null {
    const date = publishDate ? publishDate.slice(0, 10) : null;
    return status === ArticleStatus.Published && !date ? isoDate(new Date()) : date;
}

/** The stored article with only its status changed, as the update endpoint expects. */
export function withStatus(a: Article, status: ArticleStatus): ArticleWriteBody {
    return {
        title: a.title,
        slug: a.slug,
        author: a.author,
        category: a.category,
        tags: a.tags || null,
        coverImageUrl: a.coverImageUrl || null,
        excerpt: a.excerpt,
        content: a.content,
        status,
        publishDate: publishDateFor(status, a.publishDate),
        readTime: a.readTime || null,
    };
}

/** URL-safe slug from a title, as the CMS has always generated it. */
export function slugify(title: string): string {
    return (title ?? '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/** Reading time at 200 words a minute, at least one minute. */
export function readTimeFor(content: string): string {
    const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** Public page of an article on the patient-facing site. */
export function publicUrlOf(a: Pick<Article, 'id'>): string {
    return `/blog/${a.id}`;
}
