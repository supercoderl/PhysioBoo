import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { finalize } from "rxjs";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { ImportResourceResult, ResourceService } from "../../../../services/admin/resource.service";
import { InitService } from "../../../../services/common/init.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Language } from "../../../../shared/types/sys-language.types";

interface ResourceRow {
    key: string;
    value: string;
}

const PAGE_LIMIT = 200;
const FIELD = 'w-full h-9 px-3 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
const CARD = 'bg-surface rounded-2 border border-borderGray/60';

/** Flattens nested resource JSON into `a.b.c` keys so it reads as one table. */
function flatten(value: unknown, prefix = ''): ResourceRow[] {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.entries(value as Record<string, unknown>)
            .flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key));
    }
    return [{ key: prefix, value: typeof value === 'string' ? value : JSON.stringify(value) }];
}

/** Read a language's translation resources and import new ones from a file or URL. */
@Component({
    selector: 'superadmin-localization',
    standalone: true,
    imports: [SharedModule, SuperadminPageHeaderComponent, BooSelectComponent, EmptyStateComponent, ErrorStateComponent],
    template: `
        <div class="space-y-5">
            <superadmin-page-header
                title="Localization"
                description="Translation resources used by every tenant's app."
            />

            <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
                <!-- Resources -->
                <section [class]="card" aria-labelledby="resources-title">
                    <div class="flex items-end gap-3 flex-wrap px-4 py-3 border-b border-borderGray/60">
                        <h3 id="resources-title" class="text-sm font-semibold text-regular m-0 mr-auto">Resources</h3>
                        <div class="space-y-1">
                            <span class="block text-[12px] font-medium text-secondary">Language</span>
                            <div class="w-52">
                                <boo-select
                                    label="Choose a language"
                                    required
                                    [height]="36"
                                    [options]="languageOptions"
                                    [ngModel]="languageCode()"
                                    (ngModelChange)="selectLanguage($event)"
                                ></boo-select>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <label for="loc-search" class="block text-[12px] font-medium text-secondary">Search</label>
                            <input id="loc-search" type="search" [class]="field + ' w-56'" placeholder="Key or text" autocomplete="off" [ngModel]="search()" (ngModelChange)="search.set($event)" />
                        </div>
                    </div>

                    <div *ngIf="!languages.length" role="status">
                        <boo-empty-state icon="info" title="No languages configured" description="Add a language on the server to see its resources." />
                    </div>

                    <ng-container *ngIf="languages.length">
                        <div *ngIf="loading()" class="p-4 space-y-2" aria-busy="true">
                            <div *ngFor="let _ of [1, 2, 3, 4, 5, 6]" class="h-8 rounded bg-gray-100 animate-pulse motion-reduce:animate-none"></div>
                        </div>

                        <div *ngIf="!loading() && failed()" role="alert">
                            <boo-error-state icon="info" title="Couldn't load resources" description="Check your connection and try again." (retry)="load()" />
                        </div>

                        <div *ngIf="!loading() && !failed()">
                            <pre *ngIf="rawText()" class="m-0 p-4 text-[12px] font-mono whitespace-pre-wrap break-all text-regular">{{ rawText() }}</pre>

                            <boo-empty-state
                                *ngIf="!rawText() && !rows().length"
                                icon="info"
                                title="No resources found"
                                [description]="search() ? 'Nothing matches your search.' : 'This language has no resources yet. Import a file to add some.'"
                            />

                            <div *ngIf="!rawText() && rows().length" class="overflow-x-auto max-h-[60svh]" custom-scrollbar>
                                <table class="w-full text-[13px] text-left">
                                    <caption class="sr-only">Resources for {{ languageCode() }}</caption>
                                    <thead class="sticky top-0 z-[1] bg-surface">
                                        <tr class="border-b border-borderGray/60 text-secondary">
                                            <th scope="col" class="px-4 py-2.5 font-medium w-[40%]">Key</th>
                                            <th scope="col" class="px-4 py-2.5 font-medium">Text</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let row of visibleRows()" class="border-b border-borderGray/60 last:border-b-0 align-top">
                                            <td class="px-4 py-2.5 font-mono text-[12px] text-regular break-all">{{ row.key }}</td>
                                            <td class="px-4 py-2.5 text-regular break-words">{{ row.value }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p class="m-0 px-4 py-3 text-xs text-secondary tabular-nums border-t border-borderGray/60">
                                    Showing {{ visibleRows().length }} of {{ rows().length }}{{ rows().length > visibleRows().length ? ' — narrow the search to see the rest' : '' }}
                                </p>
                            </div>
                        </div>
                    </ng-container>
                </section>

                <!-- Import -->
                <section [class]="card" aria-labelledby="import-title">
                    <h3 id="import-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Import resources</h3>
                    <div class="p-4 space-y-5">
                        <div class="space-y-2">
                            <label for="import-file" class="text-[13px] font-medium text-regular">From a file</label>
                            <input
                                id="import-file"
                                type="file"
                                accept=".json,application/json"
                                class="block w-full text-[13px] text-regular file:mr-3 file:h-9 file:px-3 file:rounded-1.5 file:border file:border-borderGray file:bg-surface file:text-[13px] file:font-medium file:cursor-pointer"
                                (change)="onFileSelected($event)"
                            />
                            <button
                                type="button"
                                class="h-9 px-4 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                [disabled]="!file() || importing()"
                                (click)="importFile()"
                            >
                                {{ importing() ? 'Importing…' : 'Import file' }}
                            </button>
                        </div>

                        <div class="space-y-2 pt-5 border-t border-borderGray/60">
                            <label for="import-url" class="text-[13px] font-medium text-regular">From a URL</label>
                            <input id="import-url" type="url" [class]="field" placeholder="https://…/resources.json" autocomplete="off" [ngModel]="url()" (ngModelChange)="url.set($event)" />
                            <button
                                type="button"
                                class="h-9 px-4 rounded-1.5 border border-borderGray bg-surface text-[13px] font-medium text-regular hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                [disabled]="!url().trim() || importing()"
                                (click)="importUrl()"
                            >
                                Import from URL
                            </button>
                        </div>

                        <p *ngIf="lastResult() as result" class="m-0 text-[13px] text-regular rounded-1.5 bg-emerald-50 border border-emerald-200 px-3 py-2" role="status">
                            Imported — <strong class="tabular-nums">{{ result.inserted }}</strong> added,
                            <strong class="tabular-nums">{{ result.updated }}</strong> updated.
                        </p>
                        <p class="m-0 text-[12px] text-secondary">Existing keys are updated; new keys are added. Nothing is deleted.</p>
                    </div>
                </section>
            </div>
        </div>
    `
})
export class SuperadminLocalizationComponent implements OnInit {
    // #region Inject Services
    private readonly resourceSrv = inject(ResourceService);
    private readonly initSrv = inject(InitService);
    private readonly toastSrv = inject(ToastService);
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly card = CARD;
    readonly field = FIELD;
    readonly languages: Language[] = this.initSrv.getConfig()?.languages ?? [];
    readonly languageOptions = this.languages.map(l => ({ label: `${l.name} (${l.code})`, value: l.code }));

    languageCode = signal(this.languages.find(l => l.isDefault)?.code ?? this.languages[0]?.code ?? '');
    search = signal('');
    allRows = signal<ResourceRow[]>([]);
    /** Set when the server's text isn't JSON, so it is shown as-is instead of hidden. */
    rawText = signal<string | null>(null);
    loading = signal(false);
    failed = signal(false);

    file = signal<File | null>(null);
    url = signal('');
    importing = signal(false);
    lastResult = signal<ImportResourceResult | null>(null);

    rows = computed(() => {
        const term = this.search().trim().toLowerCase();
        const all = this.allRows();
        return term ? all.filter(r => r.key.toLowerCase().includes(term) || r.value.toLowerCase().includes(term)) : all;
    });
    visibleRows = computed(() => this.rows().slice(0, PAGE_LIMIT));
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        if (this.languageCode()) this.load();
    }
    // #endregion

    // #region Methods
    selectLanguage(code: string): void {
        this.languageCode.set(code);
        this.search.set('');
        this.load();
    }

    load(): void {
        const code = this.languageCode();
        if (!code) return;

        this.loading.set(true);
        this.failed.set(false);
        this.rawText.set(null);
        this.resourceSrv.search(code).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: res => {
                if (!res.success) {
                    this.failed.set(true);
                    return;
                }
                this.show(res.data);
            },
            error: () => this.failed.set(true)
        });
    }

    private show(text: string | null): void {
        if (!text) {
            this.allRows.set([]);
            return;
        }
        try {
            this.allRows.set(flatten(JSON.parse(text)).sort((a, b) => a.key.localeCompare(b.key)));
        } catch {
            this.allRows.set([]);
            this.rawText.set(text);
        }
    }

    onFileSelected(event: Event): void {
        this.file.set((event.target as HTMLInputElement).files?.[0] ?? null);
    }

    importFile(): void {
        const file = this.file();
        if (!file) return;
        this.runImport(this.resourceSrv.importLocal(file));
    }

    importUrl(): void {
        const url = this.url().trim();
        if (url) this.runImport(this.resourceSrv.importRemote(url));
    }

    private runImport(request: ReturnType<ResourceService['importLocal']>): void {
        this.importing.set(true);
        request.pipe(
            finalize(() => this.importing.set(false))
        ).subscribe(res => {
            if (!res.success) return;
            this.lastResult.set(res.data);
            this.toastSrv.success('Resources imported');
            this.load();
        });
    }
    // #endregion
}
