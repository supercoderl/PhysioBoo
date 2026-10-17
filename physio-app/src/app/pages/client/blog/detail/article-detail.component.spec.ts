import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { PublicArticleService } from '../../../../services/public/public-article.service';
import { ArticleCategory } from '../../../../shared/enums/article';
import { PublicArticle } from '../../../../shared/types/public-article.types';
import { ArticleDetailComponent } from './article-detail.component';
import { parseArticleContent } from './article-content';

const ID = 'c1000000-0000-0000-0000-000000000001';

function article(patch: Partial<PublicArticle> = {}): PublicArticle {
    return {
        id: ID, title: 'Recovering from a lower back strain', slug: 'back-strain', category: ArticleCategory.Wellness,
        tags: 'Back pain, Recovery, , Exercise', coverImageUrl: 'https://cdn.example/cover.jpg',
        excerpt: 'Most back strains improve with time and gentle movement.',
        content: 'Intro.\n\n## What a back strain is\nText.\n\n## The first few days\nText.\n\n## Weeks two to six\nText.',
        author: 'Thu Bui', publishDate: '2026-10-12T00:00:00', readTime: '8 min read',
        createdAt: '2026-10-10T00:00:00', updatedAt: '2026-10-15T09:00:00', ...patch,
    };
}

interface Setup {
    id?: string;
    get?: () => Observable<any>;
    related?: () => Observable<PublicArticle[]>;
}

function setup(o: Setup = {}) {
    const params$ = new BehaviorSubject(convertToParamMap({ id: o.id ?? ID }));
    const gets: string[] = [];
    const titles: string[] = [];
    const tags: Record<string, string | null> = {};
    const injector = Injector.create({
        providers: [
            { provide: ActivatedRoute, useValue: { paramMap: params$ } },
            {
                provide: PublicArticleService, useValue: {
                    getById: (id: string) => { gets.push(id); return o.get ? o.get() : of({ success: true, data: article() }); },
                    related: () => o.related ? o.related() : of([]),
                }
            },
            { provide: Title, useValue: { setTitle: (t: string) => titles.push(t) } },
            {
                provide: Meta, useValue: {
                    updateTag: (t: { name?: string; property?: string; content: string }) => { tags[(t.name ?? t.property)!] = t.content; return null; },
                    removeTag: (sel: string) => { tags[sel.replace(/^(name|property)="|"$/g, '')] = null; },
                }
            },
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DestroyRef, useValue: { onDestroy: () => () => { } } },
        ],
    });
    const cmp = runInInjectionContext(injector, () => new ArticleDetailComponent());
    cmp.ngOnInit();
    return { cmp, gets, titles, tags, params$ };
}

describe('ArticleDetailComponent (public article)', () => {
    it('loads the article, builds the contents list and tags, and sets the head tags', () => {
        const { cmp, titles, tags } = setup();
        expect(cmp.state).toBe('live');
        expect(cmp.categoryLabel).toBe('Wellness');
        expect(cmp.initials).toBe('TB');
        expect(cmp.tags).toEqual(['Back pain', 'Recovery', 'Exercise']);
        expect(cmp.toc.map(t => t.text)).toEqual(['What a back strain is', 'The first few days', 'Weeks two to six']);
        expect(cmp.activeId).toBe(cmp.toc[0].id);
        expect(titles.at(-1)).toBe('Recovering from a lower back strain | PhysioBoo');
        expect(tags['description']).toBe('Most back strains improve with time and gentle movement.');
        expect(tags['og:image']).toBe('https://cdn.example/cover.jpg');
        expect(tags['robots']).toBeNull();
    });

    it('hides the contents list with fewer than 3 section headings', () => {
        const { cmp } = setup({ get: () => of({ success: true, data: article({ content: '## One\nA\n\n## Two\nB' }) }) });
        expect(cmp.hasToc).toBeFalse();
    });

    it('shows the update date only when it is on a later day than the publish date', () => {
        expect(setup().cmp.updatedDate).toBe('2026-10-15T09:00:00');
        const sameDay = setup({ get: () => of({ success: true, data: article({ updatedAt: '2026-10-12T18:00:00' }) }) });
        expect(sameDay.cmp.updatedDate).toBeNull();
        const none = setup({ get: () => of({ success: true, data: article({ updatedAt: null }) }) });
        expect(none.cmp.updatedDate).toBeNull();
    });

    it('treats null data (draft or archived) and 404 as unavailable, with noindex', () => {
        const nul = setup({ get: () => of({ success: true, data: null }) });
        expect(nul.cmp.state).toBe('notfound');
        expect(nul.tags['robots']).toBe('noindex');
        const missing = setup({ get: () => throwError(() => new HttpErrorResponse({ status: 404 })) });
        expect(missing.cmp.state).toBe('notfound');
    });

    it('shows unavailable for a malformed id without calling the API', () => {
        const { cmp, gets } = setup({ id: 'not-a-guid' });
        expect(cmp.state).toBe('notfound');
        expect(gets).toEqual([]);
    });

    it('shows an error with retry for other failures', () => {
        let fail = true;
        const { cmp, gets } = setup({
            get: () => fail ? throwError(() => new HttpErrorResponse({ status: 500 })) : of({ success: true, data: article() }),
        });
        expect(cmp.state).toBe('error');
        fail = false;
        cmp.retry();
        expect(cmp.state).toBe('live');
        expect(gets.length).toBe(2);
    });

    it('loads related articles, and hides the section when that search fails', () => {
        const other = article({ id: 'c1000000-0000-0000-0000-000000000002' });
        const ok = setup({ related: () => of([other]) });
        expect(ok.cmp.relatedState).toBe('live');
        expect(ok.cmp.related).toEqual([other]);

        const bad = setup({ related: () => throwError(() => new HttpErrorResponse({ status: 500 })) });
        expect(bad.cmp.state).toBe('live');
        expect(bad.cmp.relatedState).toBe('error');
    });

    it('omits og:image and falls back to the content for the description', () => {
        const { tags } = setup({ get: () => of({ success: true, data: article({ coverImageUrl: null, excerpt: '', content: 'Just  the\n\ncontent.' }) }) });
        expect(tags['og:image']).toBeNull();
        expect(tags['description']).toBe('Just the content.');
    });
});

describe('ArticleDetailComponent (rendered)', () => {
    function render(data: PublicArticle | null) {
        TestBed.configureTestingModule({
            imports: [ArticleDetailComponent],
            providers: [
                provideRouter([]),
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: ID })) } },
                { provide: PublicArticleService, useValue: { getById: () => of({ success: true, data }), related: () => of([]) } },
            ],
        });
        const fixture = TestBed.createComponent(ArticleDetailComponent);
        fixture.detectChanges();
        return fixture;
    }

    it('renders the article with its contents list, share menu and empty related state', () => {
        const content = '## One\nA\n\n- x\n- y\n\n1. s\n\n## Two\n> [!TIP] Keep moving.\n\n## Three\n> [!NOTE] Title\n> Body';
        const fixture = render(article({ content }));
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('h1')?.textContent).toContain('Recovering from a lower back strain');
        expect(el.querySelectorAll('nav[aria-labelledby="toc-h"] li').length).toBe(3);
        expect(el.querySelector('aside[aria-label="Key takeaway"]')?.textContent).toContain('Keep moving.');
        expect(el.querySelector('aside[role="note"]')?.textContent).toContain('Body');
        expect(el.textContent).toContain('No related articles yet');

        (el.querySelector('button[aria-haspopup="menu"]') as HTMLButtonElement).click();
        fixture.detectChanges();
        expect(el.querySelectorAll('[role="menuitem"]').length).toBeGreaterThanOrEqual(2);

        (el.querySelector('button[aria-controls="toc-m"]') as HTMLButtonElement).click();
        fixture.detectChanges();
        expect(el.querySelectorAll('#toc-m li').length).toBe(3);
    });

    it('renders the unavailable state', () => {
        const el: HTMLElement = render(null).nativeElement;
        expect(el.querySelector('h1')?.textContent).toContain("This article isn't available");
    });
});

describe('parseArticleContent', () => {
    it('splits plain text into paragraphs on blank lines, keeping single line breaks', () => {
        expect(parseArticleContent('First line\nsecond line\n\n\nNext')).toEqual([
            { kind: 'p', text: 'First line\nsecond line' },
            { kind: 'p', text: 'Next' },
        ]);
        expect(parseArticleContent(null)).toEqual([]);
    });

    it('reads headings, lists, takeaways and callouts', () => {
        const blocks = parseArticleContent([
            '## The first few days',
            'Keep moving:',
            '- Short walks',
            '- Change position',
            '1. Mobility',
            '2. Strength',
            '### Returning to work',
            '> [!TIP] Stay gently active.',
            '',
            '> [!NOTE] After a fall',
            '> Follow your team\'s advice.',
            '',
            '> A plain quote',
        ].join('\r\n'));
        expect(blocks).toEqual([
            { kind: 'h2', id: 'sec-the-first-few-days', text: 'The first few days' },
            { kind: 'p', text: 'Keep moving:' },
            { kind: 'ul', items: ['Short walks', 'Change position'] },
            { kind: 'ol', items: ['Mobility', 'Strength'] },
            { kind: 'h3', text: 'Returning to work' },
            { kind: 'takeaway', text: 'Stay gently active.' },
            { kind: 'callout', title: 'After a fall', text: 'Follow your team\'s advice.' },
            { kind: 'callout', title: null, text: 'A plain quote' },
        ]);
    });

    it('gives repeated headings unique ids', () => {
        const ids = parseArticleContent('## Summary\n\n## Summary\n\n## Tóm tắt').flatMap(b => b.kind === 'h2' ? [b.id] : []);
        expect(ids).toEqual(['sec-summary', 'sec-summary-2', 'sec-tom-tat']);
    });

    it('does not treat a hashtag or a dash inside a sentence as structure', () => {
        expect(parseArticleContent('#physio is great - really')).toEqual([{ kind: 'p', text: '#physio is great - really' }]);
    });
});
