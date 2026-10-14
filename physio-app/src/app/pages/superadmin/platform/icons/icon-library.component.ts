import { isPlatformBrowser } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, HostListener, PLATFORM_ID, ViewChild, computed, inject, signal } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { IconComponent, PHYSIO_ICON_NAMES } from "physioboo-icons";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { ToastService } from "../../../../services/common/toast.service";

const ICON_BASE_PATH = 'assets/icons';
/** Parallel downloads while loading the library; keeps the browser's request queue short for large sets. */
const FETCH_CONCURRENCY = 12;
const COPIED_FEEDBACK_MS = 1200;

interface IconSource {
    /** Original file contents, copied verbatim. */
    raw: string;
    html: SafeHtml;
}

/** Super Admin tool: browse, search and click-to-copy every SVG in `src/assets/icons`. */
@Component({
    selector: 'superadmin-icon-library',
    standalone: true,
    imports: [IconComponent, SuperadminPageHeaderComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <!-- relative: contains the sr-only elements so they cannot extend the document past the shell's overflow-hidden -->
        <div class="relative space-y-5">
            <superadmin-page-header
                title="Icons"
                [description]="total + ' icons from src/assets/icons. Click an icon to copy its SVG.'"
            />

            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <label class="relative flex-1 block">
                    <span class="sr-only">Search icons</span>
                    <physio-icon name="search" [class]="'absolute left-3 top-1/2 -translate-y-1/2 text-placeholder pointer-events-none'" />
                    <input
                        #search
                        type="search"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="Search {{ total }} icons…"
                        [value]="query()"
                        (input)="query.set(search.value)"
                        (keydown.escape)="query.set(''); search.blur()"
                        class="w-full h-[42px] pl-9 pr-12 rounded-[10px] border border-borderGray bg-surface text-[14px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                    <kbd class="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 rounded border border-borderGray px-1.5 text-[11px] font-mono text-placeholder">/</kbd>
                </label>
                <p class="m-0 shrink-0 text-[13px] text-placeholder tabular-nums" aria-live="polite">
                    @if (query().trim()) {
                        {{ filtered().length }} of {{ total }} icons
                    } @else {
                        {{ total }} icons
                    }
                </p>
            </div>

            @if (filtered().length) {
                <ul class="icon-grid list-none m-0 p-0">
                    @for (name of filtered(); track name) {
                        <li class="icon-tile">
                            <button
                                type="button"
                                class="group w-full h-full flex flex-col items-center justify-center gap-3 rounded-[10px] border border-solid bg-surface px-2 pt-4 pb-3 cursor-pointer transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                                [class]="copied() === name ? 'border-emerald-500' : 'border-borderGray hover:border-primary'"
                                [title]="name"
                                [attr.aria-label]="'Copy ' + name + ' SVG'"
                                (click)="copy(name)"
                            >
                                <span class="icon-preview text-regular group-hover:text-primary transition-colors duration-150">
                                    @if (sources()[name]; as src) {
                                        <span class="icon-svg" [innerHTML]="src.html"></span>
                                    } @else if (failed().has(name)) {
                                        <physio-icon name="triangle-alert" [size]="20" [class]="'text-danger'" />
                                    } @else {
                                        <span class="block w-6 h-6 rounded-[6px] bg-borderGray animate-pulse"></span>
                                    }
                                </span>
                                @if (copied() === name) {
                                    <span class="flex items-center gap-1 text-[12px] font-medium text-emerald-600">
                                        <physio-icon name="check" [size]="12" />Copied!
                                    </span>
                                } @else {
                                    <span class="w-full truncate text-center text-[12px] leading-4 text-placeholder group-hover:text-regular">{{ name }}</span>
                                }
                            </button>
                        </li>
                    }
                </ul>
            } @else {
                <div class="flex flex-col items-center gap-2 py-20 text-center bg-surface rounded-[14px] border border-borderGray">
                    <physio-icon name="search-x" [size]="28" [class]="'text-placeholder'" />
                    <p class="m-0 text-[14px] text-regular">No icons match “{{ query().trim() }}”</p>
                    <button type="button" class="text-[13px] text-primary bg-transparent border-0 cursor-pointer p-0" (click)="query.set('')">Clear search</button>
                </div>
            }
        </div>
    `,
    styles: [`
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
            gap: 8px;
        }
        /* Off-screen tiles skip layout and paint, so thousands of icons still scroll smoothly. */
        .icon-tile {
            height: 100px;
            content-visibility: auto;
            contain-intrinsic-size: auto 100px;
        }
        .icon-preview {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
        }
        .icon-svg {
            display: flex;
            width: 100%;
            height: 100%;
        }
        /* Fit any viewBox into the 24px box; the default preserveAspectRatio keeps proportions. */
        .icon-svg ::ng-deep svg {
            display: block;
            width: 100%;
            height: 100%;
        }
    `]
})
export class SuperadminIconLibraryComponent {
    private readonly sanitizer = inject(DomSanitizer);
    private readonly toast = inject(ToastService);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private destroyed = false;
    private copiedTimer?: ReturnType<typeof setTimeout>;

    @ViewChild('search', { static: true }) private searchInput!: ElementRef<HTMLInputElement>;

    readonly names = PHYSIO_ICON_NAMES;
    readonly total = PHYSIO_ICON_NAMES.length;

    readonly query = signal('');
    readonly sources = signal<Record<string, IconSource>>({});
    readonly failed = signal<ReadonlySet<string>>(new Set());
    readonly copied = signal<string | null>(null);

    /** Matches on file name; spaces are treated like the hyphens in names ("arrow up" finds "arrow-up"). */
    readonly filtered = computed(() => {
        const terms = this.query().trim().toLowerCase().split(/[\s_-]+/).filter(Boolean);
        if (!terms.length) return this.names;
        return this.names.filter((name) => terms.every((term) => name.includes(term)));
    });

    constructor() {
        inject(DestroyRef).onDestroy(() => {
            this.destroyed = true;
            clearTimeout(this.copiedTimer);
        });
        if (this.isBrowser) this.loadAll();
    }

    /** "/" focuses search, like most icon sites. */
    @HostListener('document:keydown', ['$event'])
    onKeydown(event: KeyboardEvent): void {
        const target = event.target as HTMLElement | null;
        const typing = target?.closest('input, textarea, [contenteditable="true"]');
        if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            this.searchInput.nativeElement.focus();
        }
    }

    async copy(name: string): Promise<void> {
        const source = this.sources()[name];
        if (!source) {
            this.toast.error(
                this.failed().has(name) ? `Could not load ${name}.svg` : `${name}.svg is still loading, try again in a moment`,
                'Copy failed'
            );
            return;
        }

        try {
            await writeToClipboard(source.raw);
        } catch {
            this.toast.error('Your browser blocked clipboard access. Allow it for this site and try again.', 'Copy failed');
            return;
        }

        clearTimeout(this.copiedTimer);
        this.copied.set(name);
        this.copiedTimer = setTimeout(() => this.copied.set(null), COPIED_FEEDBACK_MS);
    }

    /** Downloads every SVG with a small worker pool; results are flushed once per frame to keep rendering cheap. */
    private async loadAll(): Promise<void> {
        const queue = [...this.names];
        let pending: Record<string, IconSource> = {};
        let pendingFailures: string[] = [];
        let frame = 0;

        const flush = () => {
            frame = 0;
            if (this.destroyed) return;
            const loaded = pending;
            const failures = pendingFailures;
            pending = {};
            pendingFailures = [];
            this.sources.update((current) => ({ ...current, ...loaded }));
            if (failures.length) this.failed.update((current) => new Set([...current, ...failures]));
        };
        const scheduleFlush = () => {
            if (!frame) frame = requestAnimationFrame(flush);
        };

        const worker = async () => {
            while (queue.length && !this.destroyed) {
                const name = queue.shift()!;
                try {
                    const res = await fetch(`${ICON_BASE_PATH}/${name}.svg`);
                    if (!res.ok) throw new Error(String(res.status));
                    const raw = await res.text();
                    pending[name] = { raw, html: this.sanitizer.bypassSecurityTrustHtml(raw) };
                } catch {
                    pendingFailures.push(name);
                }
                scheduleFlush();
            }
        };

        await Promise.all(Array.from({ length: Math.min(FETCH_CONCURRENCY, queue.length) }, worker));
        if (frame) cancelAnimationFrame(frame);
        flush();

        const failedCount = this.failed().size;
        if (failedCount && !this.destroyed) {
            this.toast.error(`${failedCount} icon${failedCount > 1 ? 's' : ''} could not be loaded.`, 'Icon library');
        }
    }
}

/** Async Clipboard API, with a fallback for contexts where it is unavailable (e.g. plain HTTP on a LAN address). */
async function writeToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return;
        } catch {
            // Permission denied or document not focused: fall through to the legacy path.
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        if (!document.execCommand('copy')) throw new Error('copy command rejected');
    } finally {
        textarea.remove();
    }
}
