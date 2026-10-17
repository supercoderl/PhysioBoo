/**
 * Article content is plain text from a textarea (the CMS has no rich-text editor yet). Blank lines separate
 * paragraphs. A small Markdown subset is recognised so authors can add structure without new storage:
 *
 *   ## Heading            ### Subheading
 *   - item / * item       1. step
 *   > [!TIP] text         → key takeaway
 *   > [!NOTE] Title       → callout (the following `>` lines are its text; a plain `>` quote is a callout without title)
 *
 * The result is rendered with Angular bindings only, never as HTML, so content can't inject markup.
 */

export type ArticleBlock =
    | { kind: 'p'; text: string }
    | { kind: 'h2'; id: string; text: string }
    | { kind: 'h3'; text: string }
    | { kind: 'ul'; items: string[] }
    | { kind: 'ol'; items: string[] }
    | { kind: 'takeaway'; text: string }
    | { kind: 'callout'; title: string | null; text: string };

export interface ArticleHeading {
    id: string;
    text: string;
}

/** The contents list appears only when an article has at least this many section headings. */
export const TOC_MIN_HEADINGS = 3;

const HEADING = /^(#{1,3})\s+(.+?)\s*#*\s*$/;
const UL_ITEM = /^\s*[-*•]\s+(.*)$/;
const OL_ITEM = /^\s*\d+[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const ALERT = /^\[!(\w+)\]\s*(.*)$/;
const TAKEAWAY_TYPES = ['TIP', 'TAKEAWAY'];

export function parseArticleContent(content: string | null | undefined): ArticleBlock[] {
    const lines = (content ?? '').replace(/\r\n?/g, '\n').split('\n');
    const blocks: ArticleBlock[] = [];
    const ids = new Set<string>();
    let i = 0;

    const take = (re: RegExp): string[] => {
        const out: string[] = [];
        while (i < lines.length && re.test(lines[i])) out.push(lines[i++].match(re)![1].trim());
        return out;
    };

    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }

        const h = line.match(HEADING);
        if (h) {
            i++;
            const text = h[2].trim();
            if (h[1].length === 3) blocks.push({ kind: 'h3', text });
            else blocks.push({ kind: 'h2', id: uniqueId(text, ids), text });
            continue;
        }
        if (UL_ITEM.test(line)) { blocks.push({ kind: 'ul', items: take(UL_ITEM).filter(Boolean) }); continue; }
        if (OL_ITEM.test(line)) { blocks.push({ kind: 'ol', items: take(OL_ITEM).filter(Boolean) }); continue; }
        if (QUOTE.test(line)) {
            const quote = quoteBlock(take(QUOTE));
            if (quote) blocks.push(quote);
            continue;
        }

        const para: string[] = [];
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) para.push(lines[i++].trim());
        blocks.push({ kind: 'p', text: para.join('\n') });
    }
    return blocks;
}

export function articleHeadings(blocks: ArticleBlock[]): ArticleHeading[] {
    return blocks.flatMap(b => b.kind === 'h2' ? [{ id: b.id, text: b.text }] : []);
}

function startsBlock(line: string): boolean {
    return HEADING.test(line) || UL_ITEM.test(line) || OL_ITEM.test(line) || QUOTE.test(line);
}

function quoteBlock(lines: string[]): ArticleBlock | null {
    const alert = lines[0]?.match(ALERT);
    if (alert && TAKEAWAY_TYPES.includes(alert[1].toUpperCase())) {
        const text = joinText([alert[2], ...lines.slice(1)]);
        return text ? { kind: 'takeaway', text } : null;
    }
    if (alert) {
        const rest = joinText(lines.slice(1));
        const head = alert[2].trim();
        // "> [!NOTE] Just one line" has no separate title.
        return rest ? { kind: 'callout', title: head || null, text: rest } : head ? { kind: 'callout', title: null, text: head } : null;
    }
    const text = joinText(lines);
    return text ? { kind: 'callout', title: null, text } : null;
}

function joinText(lines: string[]): string {
    return lines.map(l => l.trim()).filter(Boolean).join(' ');
}

function uniqueId(text: string, ids: Set<string>): string {
    const base = 'sec-' + (text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'section');
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;
    ids.add(id);
    return id;
}
