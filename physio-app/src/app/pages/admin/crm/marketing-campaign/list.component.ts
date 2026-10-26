import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooFilterChip,
    BooFilterChipsComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
    BooPaginationComponent,
    BooSearchFieldComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { AudienceSegmentService } from '../../../../services/admin/audience-segment.service';
import { CampaignService } from '../../../../services/admin/campaign.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { CampaignStatus, CampaignType } from '../../../../shared/enums/campaign';
import { AudienceSegment } from '../../../../shared/types/audience-segment.types';
import { Campaign, CampaignStats } from '../../../../shared/types/campaign.types';
import { PaginationData } from '../../../../shared/types/common';
import { CrmCampaignDetailDrawerComponent } from './campaign-detail-drawer.component';
import { CrmCampaignEditDrawerComponent } from './campaign-edit-drawer.component';
import {
    CHANNEL,
    CHANNEL_OPTIONS,
    CampaignTransition,
    STATUS,
    budgetUse,
    channelOf,
    parseIsoDate,
    primaryTransitionOf,
    statusOf,
    timingOf,
    withStatus,
} from './campaign.utils';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'channel' | 'range';
}

interface StatusTab {
    value: CampaignStatus | null;
    label: string;
}

const PAGE_SIZE = 20;

/** How each status change is reported once it is saved. */
const MOVED: Record<CampaignStatus, string> = {
    [CampaignStatus.Draft]: 'Moved back to draft',
    [CampaignStatus.Scheduled]: 'Campaign scheduled',
    [CampaignStatus.Active]: 'Campaign live',
    [CampaignStatus.Paused]: 'Campaign paused',
    [CampaignStatus.Completed]: 'Campaign completed',
    [CampaignStatus.Cancelled]: 'Campaign cancelled',
};

/**
 * Marketing campaign workspace (POST /api/campaigns/search). The server searches name and code, filters by one
 * channel, one status and the days a campaign runs, and leaves cancelled campaigns out unless that status is asked
 * for. Status changes go through the regular update endpoint with the campaign's other fields unchanged.
 */
@Component({
    selector: 'crm-marketing-campaign-list',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        DatePipe,
        DecimalPipe,
        FormsModule,
        BooButtonComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooFilterChipsComponent,
        BooDatepickerComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        CrmCampaignDetailDrawerComponent,
        CrmCampaignEditDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class CrmMarketingCampaignListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly campaignSrv = inject(CampaignService);
    private readonly segmentSrv = inject(AudienceSegmentService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly statusTabs: StatusTab[] = [
        { value: null, label: 'All' },
        ...[CampaignStatus.Active, CampaignStatus.Scheduled, CampaignStatus.Draft, CampaignStatus.Paused, CampaignStatus.Completed, CampaignStatus.Cancelled]
            .map(value => ({ value, label: STATUS[value].label })),
    ];
    readonly channelOptions = CHANNEL_OPTIONS;
    readonly sortOptions = [
        { value: '-createddate', label: 'Newest first' },
        { value: '+createddate', label: 'Oldest first' },
        { value: '+startdate', label: 'Start date (earliest)' },
        { value: '-startdate', label: 'Start date (latest)' },
        { value: '+name', label: 'Name (A–Z)' },
        { value: '-budget', label: 'Largest budget' },
    ];
    readonly skeletonRows = Array.from({ length: 8 });
    readonly status = statusOf;
    readonly channel = channelOf;
    readonly timing = timingOf;
    readonly nextMove = primaryTransitionOf;
    readonly use = budgetUse;
    readonly date = parseIsoDate;
    readonly min = Math.min;

    query = '';
    statusFilter: CampaignStatus | null = null;
    channelFilter: CampaignType | null = null;
    from: string | null = null;
    to: string | null = null;
    sort = '-createddate';
    page = 1;

    data: PaginationData<Campaign> | null = null;
    stats: CampaignStats | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Campaigns with a request in flight, and the status being applied ('delete' for a delete). */
    busy = new Map<string, CampaignStatus | 'delete'>();

    selected: Campaign | null = null;
    editorOpen = false;
    editing: Campaign | null = null;
    /** Reopen the details after editing when the edit started there. */
    private returnToDetail = false;

    segments: AudienceSegment[] = [];
    segmentError: string | null = null;
    private segmentsState: 'idle' | 'loading' | 'done' = 'idle';

    canCreate = false;
    canUpdate = false;
    canDelete = false;

    private readonly load$ = new Subject<void>();
    private readonly query$ = new Subject<string>();
    /** The search term last sent to the server. */
    private lastSearched = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next search.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.campaignSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: {
                            start: this.rangeInvalid ? null : this.from,
                            end: this.rangeInvalid ? null : this.to,
                            type: this.channelFilter,
                            status: this.statusFilter,
                        },
                    }).pipe(
                        map(res => ({ res, err: null as HttpErrorResponse | null })),
                        catchError((err: HttpErrorResponse) => of({ res: null, err })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ res, err }) => {
                if (err || !res?.success || !res.data) {
                    this.failLoad(err?.status === 403 ? 'forbidden' : 'failed');
                    return;
                }
                this.data = { ...res.data, items: res.data.items ?? [] };
                this.loadError = null;
                this.refreshErrorState = 'default';
                // Keep open details in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(c => c.id === open.id) ?? open;
            });

        this.query$
            .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                // Read the field now rather than the emitted value, in case filters were cleared meanwhile.
                const term = this.searchTerm;
                this.searchPending = false;
                if (term === this.lastSearched) return;
                this.lastSearched = term;
                this.page = 1;
                this.load();
            });

        this.load();
        this.loadStats();
    }
    // #endregion

    // #region Getters
    get items(): Campaign[] {
        return this.data?.items ?? [];
    }

    get totalPages(): number {
        return Math.max(1, this.data?.totalPages ?? Math.ceil((this.data?.totalCount ?? 0) / PAGE_SIZE));
    }

    get firstShown(): number {
        return this.items.length ? (this.page - 1) * PAGE_SIZE + 1 : 0;
    }

    get lastShown(): number {
        return (this.page - 1) * PAGE_SIZE + this.items.length;
    }

    get searchTerm(): string {
        return this.query.trim();
    }

    get rangeInvalid(): boolean {
        return !!this.from && !!this.to && this.from > this.to;
    }

    /** Filters other than the status tab. */
    get hasFilters(): boolean {
        return this.chips.length > 0;
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `“${this.searchTerm}”` });
        if (this.channelFilter !== null) chips.push({ kind: 'channel', label: CHANNEL[this.channelFilter]?.label ?? 'Channel' });
        if (!this.rangeInvalid && (this.from || this.to)) {
            const from = this.from ? this.shortDate(this.from) : null;
            const to = this.to ? this.shortDate(this.to) : null;
            const label = from && to ? `Running ${from} – ${to}` : from ? `Running on or after ${from}` : `Running on or before ${to}`;
            chips.push({ kind: 'range', label });
        }
        return chips;
    }

    get activeTab(): StatusTab {
        return this.statusTabs.find(t => t.value === this.statusFilter) ?? this.statusTabs[0];
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label.toLowerCase() ?? '';
    }

    get busySelected(): boolean {
        return !!this.selected && this.busy.has(this.selected.id);
    }

    get pendingSelectedStatus(): number | null {
        const v = this.selected ? this.busy.get(this.selected.id) : undefined;
        return typeof v === 'number' ? v : null;
    }

    get selectedCriteria(): string | null {
        const id = this.selected?.audienceSegmentId;
        return id ? this.segments.find(s => s.id === id)?.criteria ?? null : null;
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    refresh(): void {
        this.load();
        this.loadStats();
    }

    onQueryChange(): void {
        this.searchPending = this.searchTerm !== this.lastSearched;
        this.query$.next(this.query);
    }

    clearSearch(): void {
        this.query = '';
        this.onQueryChange();
    }

    selectStatus(value: CampaignStatus | null): void {
        if (value === this.statusFilter) return;
        this.statusFilter = value;
        this.page = 1;
        this.load();
    }

    /** Arrow keys, Home and End move between status tabs. */
    onTabKey(event: KeyboardEvent, index: number): void {
        const last = this.statusTabs.length - 1;
        const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
            : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : event.key === 'Home' ? 0
            : event.key === 'End' ? last
            : null;
        if (next === null) return;
        event.preventDefault();
        this.selectStatus(this.statusTabs[next].value);
        this.host.querySelector<HTMLElement>(`#campaign-tab-${next}`)?.focus();
    }

    onFilterChange(): void {
        if (this.rangeInvalid) return;
        this.page = 1;
        this.load();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    removeChip(chip: FilterChip): void {
        if (chip.kind === 'search') {
            this.clearSearch();
            return;
        }
        if (chip.kind === 'channel') this.channelFilter = null;
        else {
            this.from = null;
            this.to = null;
        }
        this.onFilterChange();
    }

    clearFilters(): void {
        this.query = '';
        this.channelFilter = null;
        this.from = null;
        this.to = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.load();
    }

    showAll(): void {
        this.statusFilter = null;
        this.clearFilters();
    }

    openDetail(c: Campaign): void {
        this.editorOpen = false;
        this.editing = null;
        this.selected = c;
        this.ensureSegments();
    }

    openCreate(): void {
        if (!this.canCreate) return;
        this.returnToDetail = false;
        this.selected = null;
        this.editing = null;
        this.editorOpen = true;
        this.ensureSegments();
    }

    openEdit(c: Campaign, fromDetail = false): void {
        if (!this.canUpdate || this.busy.has(c.id)) return;
        this.returnToDetail = fromDetail;
        this.selected = null;
        this.editing = c;
        this.editorOpen = true;
        this.ensureSegments();
    }

    closeEditor(): void {
        const c = this.editing;
        this.editorOpen = false;
        this.editing = null;
        if (c && this.returnToDetail) this.selected = this.items.find(i => i.id === c.id) ?? c;
        this.returnToDetail = false;
    }

    onSaved({ campaign, created }: { campaign: Campaign; created: boolean }): void {
        this.toastSrv.success(`${campaign.name}${campaign.code ? ' · ' + campaign.code : ''}`, created ? 'Draft campaign created' : 'Campaign updated');
        this.editorOpen = false;
        this.editing = null;
        this.returnToDetail = false;
        // Show the saved campaign so its next step (such as launching a new draft) is at hand.
        this.selected = campaign;
        this.refresh();
    }

    /** Applies a lifecycle move, asking first when it ends or abandons the campaign. */
    move(c: Campaign, t: CampaignTransition): void {
        if (!this.canUpdate || this.busy.has(c.id)) return;
        if (!t.confirm) {
            this.applyMove(c, t);
            return;
        }
        if (t.to === CampaignStatus.Cancelled) {
            this.dialogSrv.confirm(
                `Cancel “${c.name}”? It leaves the main list and stops counting as active. You can restore it as a draft from the Cancelled tab.`,
                () => this.applyMove(c, t),
                'Cancel campaign',
                'danger',
                'Cancel campaign',
                'Keep campaign',
            );
            return;
        }
        this.dialogSrv.confirm(
            `Mark “${c.name}” as completed? Use this once the campaign has finished running.`,
            () => this.applyMove(c, t),
            'Complete campaign',
            'warning',
            'Mark completed',
            'Not yet',
        );
    }

    confirmDelete(c: Campaign): void {
        if (!this.canDelete || this.busy.has(c.id)) return;
        this.dialogSrv.confirm(
            `Delete “${c.name}” (${c.code})? It will be removed from campaigns. To keep its history, cancel it instead.`,
            () => this.delete(c),
            'Delete campaign',
            'danger',
            'Delete campaign',
            'Keep campaign',
        );
    }

    trackById(_: number, c: Campaign): string {
        return c.id;
    }

    tabIndex(tab: StatusTab): number {
        return this.statusTabs.indexOf(tab);
    }
    // #endregion

    // #region Helpers
    private loadStats(): void {
        // The counts in the header are a convenience; when they fail the header simply leaves them out.
        this.campaignSrv.stats()
            .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe(res => this.stats = res?.success && res.data ? res.data : null);
    }

    private applyMove(c: Campaign, t: CampaignTransition): void {
        this.setBusy(c.id, t.to);
        // The update replaces every field, so start from the stored campaign rather than a possibly stale row.
        this.campaignSrv.search_by_id(c.id)
            .pipe(
                map(res => res?.success && res.data ? res.data : c),
                switchMap(fresh => this.campaignSrv.update(c.id, withStatus(fresh, t.to))),
                switchMap(() => this.campaignSrv.search_by_id(c.id)),
                finalize(() => this.setBusy(c.id, null)),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    const saved = res?.success && res.data ? res.data : { ...c, status: t.to };
                    this.toastSrv.success(`${saved.name} · ${saved.code}`, MOVED[t.to]);
                    if (this.selected?.id === c.id) this.selected = saved;
                    this.refresh();
                },
                // The global HTTP error toast reports the failure; the campaign keeps its status.
                error: () => undefined,
            });
    }

    private delete(c: Campaign): void {
        this.setBusy(c.id, 'delete');
        this.campaignSrv.delete(c.id)
            .pipe(finalize(() => this.setBusy(c.id, null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(`${c.name} · ${c.code}`, 'Campaign deleted');
                    if (this.selected?.id === c.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.refresh();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    private setBusy(id: string, value: CampaignStatus | 'delete' | null): void {
        const next = new Map(this.busy);
        if (value === null) next.delete(id);
        else next.set(id, value);
        this.busy = next;
    }

    /** Audience segments for the form and the details, loaded once per visit; retried after a failure. */
    private ensureSegments(): void {
        if (this.segmentsState !== 'idle') return;
        this.segmentsState = 'loading';
        this.segmentError = null;
        this.segmentSrv.lookup()
            .pipe(
                map(res => res?.success ? res.data ?? [] : null),
                catchError((err: HttpErrorResponse) => {
                    this.segmentError = err?.status === 403
                        ? "You don't have access to audience segments."
                        : "Couldn't load audience segments. Close and reopen to try again.";
                    return of(null);
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(segments => {
                if (segments) this.segments = segments;
                else if (!this.segmentError) this.segmentError = "Couldn't load audience segments. Close and reopen to try again.";
                this.segmentsState = segments ? 'done' : 'idle';
            });
    }

    private shortDate(iso: string): string {
        const d = parseIsoDate(iso);
        return d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : iso;
    }

    private failLoad(kind: LoadError): void {
        this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
        this.loadError = kind;
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the campaign API enforces.
        this.canCreate = can(Permissions.Crm.CampaignCreate);
        this.canUpdate = can(Permissions.Crm.CampaignUpdate);
        this.canDelete = can(Permissions.Crm.CampaignDelete);
    }
    // #endregion
}
