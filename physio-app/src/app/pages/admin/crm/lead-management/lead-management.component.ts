import { NgClass, NgFor, NgIf } from '@angular/common';
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
import { Observable, Subject, forkJoin, of, throwError } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { LeadService } from '../../../../services/admin/lead.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { LeadPriority, LeadStatus } from '../../../../shared/enums/lead';
import { PaginationData } from '../../../../shared/types/common';
import { LeadFilter } from '../../../../shared/types/filter.types';
import { Lead, UpdateLeadRequest } from '../../../../shared/types/lead.types';
import { CrmLeadDetailDrawerComponent, LeadBusy } from './lead-detail-drawer.component';
import { CrmLeadEditDrawerComponent } from './lead-edit-drawer.component';
import {
    ALL_STAGES,
    LEAD_LIMITS,
    LeadMove,
    MOVED,
    NEEDS_EMAIL,
    OPEN_STAGES,
    PRIORITY,
    PRIORITY_OPTIONS,
    STAGE,
    ageLabel,
    canSave,
    displayName,
    initials,
    isWaiting,
    isoDate,
    nextMoveOf,
    parseIsoDate,
    priorityOf,
    stageOf,
    waitLabel,
    updateOf,
    withNote,
} from './lead.utils';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'priority' | 'range';
}

interface StageTab {
    value: LeadStatus | null;
    label: string;
    /** Dot colour of the stage, matching its badge. */
    dot: string;
}

/** Thrown when a lead can't be saved until it has an email. */
class NeedsEmailError extends Error { }
/** Thrown when a note won't fit in the notes column. */
class NotesFullError extends Error { }

const PAGE_SIZE = 20;

const DOT: Record<string, string> = {
    warning: 'bg-amber-500',
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    neutral: 'bg-gray-400',
};

const EMPTY_STAGE: Record<LeadStatus, string> = {
    [LeadStatus.New]: 'Every enquiry has had a first contact.',
    [LeadStatus.Contacted]: 'No contacted leads are waiting to be qualified.',
    [LeadStatus.Qualified]: 'No qualified leads are waiting to convert.',
    [LeadStatus.Converted]: 'Leads show up here once they become patients or book care.',
    [LeadStatus.Lost]: 'Leads marked as lost show up here, and can be reopened.',
};

/**
 * CRM lead workspace (POST /api/leads/search). Leads move New → Contacted → Qualified → Converted, or to Lost; the
 * stage tabs are the pipeline, with live counts from the same search. The server searches name, email and phone,
 * filters by one stage, one priority and the day received, and sorts by date received, last change or name — so
 * those are the only controls offered. There is no owner or source filter, follow-up date or activity history on the
 * server, so follow-ups are logged as dated entries in the lead's notes.
 */
@Component({
    selector: 'admin-lead-management',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
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
        CrmLeadDetailDrawerComponent,
        CrmLeadEditDrawerComponent,
    ],
    templateUrl: './lead-management.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminLeadManagementComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly leadSrv = inject(LeadService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly stageTabs: StageTab[] = [
        { value: null, label: 'All leads', dot: '' },
        ...ALL_STAGES.map(value => ({ value, label: STAGE[value].label, dot: DOT[STAGE[value].tone] })),
    ];
    readonly priorityOptions = PRIORITY_OPTIONS;
    readonly sortOptions = [
        { value: '-createdat', label: 'Newest first' },
        { value: '+createdat', label: 'Oldest first' },
        { value: '-updatedat', label: 'Recently changed' },
        { value: '+name', label: 'Name (A–Z)' },
    ];
    readonly skeletonRows = Array.from({ length: 8 });
    readonly High = LeadPriority.High;
    readonly needsEmail = NEEDS_EMAIL;
    readonly name = displayName;
    readonly initials = initials;
    readonly stage = stageOf;
    readonly priority = priorityOf;
    readonly nextMove = nextMoveOf;
    readonly savable = canSave;
    readonly waiting = isWaiting;
    readonly age = ageLabel;
    readonly wait = waitLabel;

    today = isoDate(new Date());
    query = '';
    stageFilter: LeadStatus | null = null;
    priorityFilter: LeadPriority | null = null;
    from: string | null = null;
    to: string | null = null;
    sort = '-createdat';
    page = 1;

    data: PaginationData<Lead> | null = null;
    /** Leads per stage under the current search and filters; null while unknown. */
    counts: Record<LeadStatus, number> | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Leads with a request in flight, and what it is. */
    busy = new Map<string, LeadBusy>();
    /** The owner being set, per lead, while an assignment is in flight. */
    pendingOwner = new Map<string, string | null>();
    /** Bumped after a note is saved so the details clear the draft. */
    noteSaved = 0;

    selected: Lead | null = null;
    editorOpen = false;
    editing: Lead | null = null;
    /** Reopen the details after editing when the edit started there. */
    private returnToDetail = false;

    canCreate = false;
    canUpdate = false;
    canDelete = false;
    registerLink: string | null = null;
    /** The signed-in user's name, used for "Assign to me" and to sign notes. */
    me: string | null = null;

    private readonly load$ = new Subject<void>();
    private readonly counts$ = new Subject<void>();
    private readonly query$ = new Subject<string>();
    /** The search term last sent to the server. */
    private lastSearched = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));
        this.authSrv.userInfo$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(u => this.me = u?.fullName?.trim().slice(0, LEAD_LIMITS.assignedTo) || null);

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next search.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.leadSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: this.filterFor(this.stageFilter),
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
                if (open) this.selected = this.data.items.find(l => l.id === open.id) ?? open;
            });

        // One count per stage, from the same search with the same filters. They are a guide: when they fail the
        // tabs simply leave them out.
        this.counts$
            .pipe(
                switchMap(() => forkJoin(ALL_STAGES.map(s => this.leadSrv.search({
                    pageNumber: 1,
                    pageSize: 1,
                    search: this.searchTerm,
                    filter: this.filterFor(s),
                }).pipe(map(res => res?.success && res.data ? res.data.totalCount : null)))).pipe(
                    catchError(() => of(null)),
                )),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(totals => {
                this.counts = totals && totals.every(t => t !== null)
                    ? Object.fromEntries(ALL_STAGES.map((s, i) => [s, totals[i]!])) as Record<LeadStatus, number>
                    : null;
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
                this.refresh();
            });

        this.refresh();
    }
    // #endregion

    // #region Getters
    get items(): Lead[] {
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

    /** Filters other than the stage tab. */
    get hasFilters(): boolean {
        return !!this.searchTerm || this.priorityFilter !== null || ((!!this.from || !!this.to) && !this.rangeInvalid);
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `“${this.searchTerm}”` });
        if (this.priorityFilter !== null) chips.push({ kind: 'priority', label: `${PRIORITY[this.priorityFilter].label} priority` });
        if (!this.rangeInvalid && (this.from || this.to)) {
            const label = this.from && this.to ? `Received ${this.shortDate(this.from)} – ${this.shortDate(this.to)}`
                : this.from ? `Received from ${this.shortDate(this.from)}` : `Received until ${this.shortDate(this.to!)}`;
            chips.push({ kind: 'range', label });
        }
        return chips;
    }

    get activeTab(): StageTab {
        return this.stageTabs.find(t => t.value === this.stageFilter) ?? this.stageTabs[0];
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label.toLowerCase() ?? '';
    }

    get totalCount(): number | null {
        return this.counts ? ALL_STAGES.reduce((sum, s) => sum + this.counts![s], 0) : null;
    }

    /** Leads still being worked (new, contacted or qualified). */
    get openCount(): number | null {
        return this.counts ? OPEN_STAGES.reduce((sum, s) => sum + this.counts![s], 0) : null;
    }

    /** Leads waiting for a first contact. */
    get newCount(): number {
        return this.counts?.[LeadStatus.New] ?? 0;
    }

    get stageHint(): string {
        return this.stageFilter ? STAGE[this.stageFilter].hint : '';
    }

    get emptyStageText(): string {
        return this.stageFilter ? EMPTY_STAGE[this.stageFilter] : '';
    }

    get busySelected(): LeadBusy | null {
        return this.selected ? this.busy.get(this.selected.id) ?? null : null;
    }

    get pendingSelectedOwner(): string | null {
        return this.selected ? this.pendingOwner.get(this.selected.id) ?? null : null;
    }
    // #endregion

    // #region Methods
    load(): void {
        if (this.rangeInvalid) return;
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    /** Reloads the list and the stage counts. */
    refresh(): void {
        if (this.rangeInvalid) return;
        this.load();
        this.counts$.next();
    }

    countOf(tab: StageTab): number | null {
        if (!this.counts) return null;
        return tab.value === null ? this.totalCount : this.counts[tab.value];
    }

    onQueryChange(): void {
        this.searchPending = this.searchTerm !== this.lastSearched;
        this.query$.next(this.query);
    }

    clearSearch(): void {
        this.query = '';
        this.onQueryChange();
    }

    selectStage(value: LeadStatus | null): void {
        if (value === this.stageFilter) return;
        this.stageFilter = value;
        this.page = 1;
        this.load();
    }

    onTabKey(event: KeyboardEvent, index: number): void {
        const last = this.stageTabs.length - 1;
        const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
            : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : event.key === 'Home' ? 0
            : event.key === 'End' ? last
            : -1;
        if (next < 0) return;
        event.preventDefault();
        this.selectStage(this.stageTabs[next].value);
        this.host.querySelector<HTMLElement>(`#lead-tab-${next}`)?.focus();
    }

    /** Search, priority and dates change what the counts cover too. */
    onFilterChange(): void {
        if (this.rangeInvalid) return;
        this.page = 1;
        this.refresh();
    }

    onSortChange(): void {
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
        if (chip.kind === 'priority') this.priorityFilter = null;
        else {
            this.from = null;
            this.to = null;
        }
        this.onFilterChange();
    }

    clearFilters(): void {
        this.query = '';
        this.priorityFilter = null;
        this.from = null;
        this.to = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.refresh();
    }

    showAll(): void {
        this.stageFilter = null;
        this.clearFilters();
    }

    openDetail(l: Lead): void {
        this.editorOpen = false;
        this.editing = null;
        this.selected = l;
    }

    openCreate(): void {
        if (!this.canCreate) return;
        this.returnToDetail = false;
        this.selected = null;
        this.editing = null;
        this.editorOpen = true;
    }

    openEdit(l: Lead, fromDetail = false): void {
        if (!this.canUpdate || this.busy.has(l.id)) return;
        this.returnToDetail = fromDetail;
        this.selected = null;
        this.editing = l;
        this.editorOpen = true;
    }

    closeEditor(): void {
        const l = this.editing;
        this.editorOpen = false;
        this.editing = null;
        if (l && this.returnToDetail) this.selected = this.items.find(i => i.id === l.id) ?? l;
        this.returnToDetail = false;
    }

    onSaved({ lead, created }: { lead: Lead; created: boolean }): void {
        this.toastSrv.success(displayName(lead), created ? 'Lead added' : 'Lead updated');
        this.editorOpen = false;
        this.editing = null;
        this.returnToDetail = false;
        // Show the saved lead so its next step is at hand.
        this.selected = lead;
        this.refresh();
    }

    /** Applies a stage move, asking first before a lead is marked lost. */
    move(l: Lead, m: LeadMove): void {
        if (!this.canUpdate || this.busy.has(l.id)) return;
        if (!m.confirm) {
            this.applyMove(l, m);
            return;
        }
        this.dialogSrv.confirm(
            `Mark ${displayName(l)} as lost? They leave the open queue. You can reopen them from the Lost tab.`,
            () => this.applyMove(l, m),
            'Mark lead as lost',
            'danger',
            'Mark lost',
            'Keep open',
        );
    }

    assign(l: Lead, owner: string | null): void {
        if (!this.canUpdate || this.busy.has(l.id)) return;
        const next = new Map(this.pendingOwner).set(l.id, owner);
        this.pendingOwner = next;
        this.save(l, 'assign', () => ({ assignedTo: owner }), saved =>
            this.toastSrv.success(displayName(saved), owner ? `Assigned to ${owner}` : 'Lead unassigned'));
    }

    addNote(l: Lead, text: string): void {
        if (!this.canUpdate || this.busy.has(l.id)) return;
        this.save(l, 'note', fresh => {
            const notes = withNote(fresh.notes, text, this.me);
            if (notes.length > LEAD_LIMITS.notes) throw new NotesFullError();
            return { notes };
        }, saved => {
            this.noteSaved++;
            this.toastSrv.success(displayName(saved), 'Note added');
        });
    }

    confirmDelete(l: Lead): void {
        if (!this.canDelete || this.busy.has(l.id)) return;
        this.dialogSrv.confirm(
            `Delete ${displayName(l)}? The lead and its notes will be removed. To keep its history, mark it as lost instead.`,
            () => this.delete(l),
            'Delete lead',
            'danger',
            'Delete lead',
            'Keep lead',
        );
    }

    trackById(_: number, l: Lead): string {
        return l.id;
    }

    tabIndex(tab: StageTab): number {
        return this.stageTabs.indexOf(tab);
    }
    // #endregion

    // #region Helpers
    private applyMove(l: Lead, m: LeadMove): void {
        this.save(l, m.to, () => ({ status: m.to }), saved => this.toastSrv.success(displayName(saved), MOVED[m.to]));
    }

    /**
     * Saves a change to one lead. The update replaces every field, so it starts from the stored lead rather than a
     * possibly stale row, then reads the result back.
     */
    private save(l: Lead, kind: LeadBusy, patch: (fresh: Lead) => Partial<UpdateLeadRequest>, done: (saved: Lead) => void): void {
        this.setBusy(l.id, kind);
        this.leadSrv.search_by_id(l.id)
            .pipe(
                map(res => res?.success && res.data ? res.data : l),
                switchMap((fresh): Observable<unknown> => {
                    if (!canSave(fresh)) return throwError(() => new NeedsEmailError());
                    let body: UpdateLeadRequest;
                    try {
                        body = updateOf(fresh, patch(fresh));
                    } catch (e) {
                        return throwError(() => e);
                    }
                    return this.leadSrv.update(l.id, body);
                }),
                // Saved even if the read-back fails; the refresh below catches up.
                switchMap(() => this.leadSrv.search_by_id(l.id).pipe(catchError(() => of(null)))),
                finalize(() => {
                    this.setBusy(l.id, null);
                    if (kind === 'assign') {
                        const next = new Map(this.pendingOwner);
                        next.delete(l.id);
                        this.pendingOwner = next;
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    const saved = res?.success && res.data ? res.data : l;
                    done(saved);
                    if (this.selected?.id === l.id) this.selected = saved;
                    this.refresh();
                },
                // HTTP failures are reported by the global error toast; the lead keeps its values and any draft stays.
                error: (e: unknown) => {
                    if (e instanceof NeedsEmailError) this.toastSrv.error(NEEDS_EMAIL, "Lead can't be changed yet");
                    else if (e instanceof NotesFullError) this.toastSrv.error('Edit the lead to shorten its notes, then add the note again.', "Note doesn't fit");
                },
            });
    }

    private delete(l: Lead): void {
        this.setBusy(l.id, 'delete');
        this.leadSrv.delete(l.id)
            .pipe(finalize(() => this.setBusy(l.id, null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(displayName(l), 'Lead deleted');
                    if (this.selected?.id === l.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.refresh();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    private filterFor(status: LeadStatus | null): LeadFilter {
        const range = !this.rangeInvalid;
        return {
            start: range ? this.from : null,
            end: range ? this.to : null,
            status,
            priority: this.priorityFilter,
        };
    }

    private setBusy(id: string, value: LeadBusy | null): void {
        const next = new Map(this.busy);
        if (value === null) next.delete(id);
        else next.set(id, value);
        this.busy = next;
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
        // Actions follow the permissions the lead API enforces.
        this.canCreate = can(Permissions.Crm.LeadCreate);
        this.canUpdate = can(Permissions.Crm.LeadUpdate);
        this.canDelete = can(Permissions.Crm.LeadDelete);
        this.registerLink = can(Permissions.Reception.PatientRegister) ? '/admin/reception/registration' : null;
    }
    // #endregion
}
