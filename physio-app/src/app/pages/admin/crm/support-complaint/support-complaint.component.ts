import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
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
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooDatepickerComponent } from '../../../../components/date-picker/boo-date-picker.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { ComplaintService } from '../../../../services/admin/complaint.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../../../../shared/enums/complaint';
import { PaginationData } from '../../../../shared/types/common';
import { Complaint, UpdateComplaintRequest } from '../../../../shared/types/complaint.types';
import { ComplaintFilter } from '../../../../shared/types/filter.types';
import { ComplaintBusy, CrmComplaintDetailDrawerComponent } from './complaint-detail-drawer.component';
import { CrmComplaintEditDrawerComponent } from './complaint-edit-drawer.component';
import {
    ALL_STATUSES,
    CATEGORY,
    CATEGORY_OPTIONS,
    COMPLAINT_LIMITS,
    ComplaintMove,
    MOVED,
    OPEN_STATUSES,
    PRIORITY,
    PRIORITY_OPTIONS,
    STATUS,
    ageLabel,
    categoryOf,
    isOpen,
    isRaised,
    isoDate,
    movesOf,
    parseIsoDate,
    priorityOf,
    statusOf,
    subjectOf,
    ticketOf,
    updateOf,
} from './complaint.utils';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'priority' | 'category' | 'range';
}

interface StatusTab {
    value: ComplaintStatus | null;
    label: string;
    /** Dot colour class, matching the status badge tone. */
    dot: string;
}

const PAGE_SIZE = 20;

const DOT: Record<string, string> = {
    warning: 'bg-amber-500',
    primary: 'bg-primary',
    success: 'bg-emerald-500',
    neutral: 'bg-gray-400',
};

const EMPTY_STATUS: Record<ComplaintStatus, string> = {
    [ComplaintStatus.Pending]: 'Nothing is waiting to be picked up.',
    [ComplaintStatus.InProgress]: 'No one is working on a complaint right now.',
    [ComplaintStatus.Resolved]: 'Resolved tickets wait here until they are closed.',
    [ComplaintStatus.Closed]: 'Closed tickets are filed here and can be reopened.',
};

/**
 * Support and complaints workspace (POST /api/complaints/search). Tickets move Pending → In progress → Resolved →
 * Closed and can be reopened; the status tabs are that flow, with live counts from the same search. The server
 * searches ticket number, name, subject, email and phone, filters by one status, priority and category and by the day
 * a ticket was logged, and sorts by date, last change, priority or status — so those are the only controls offered.
 * There is no reply log or staff directory on the server: replies go out by phone or email, and the owner is a name.
 */
@Component({
    selector: 'admin-support-complaint',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
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
        CrmComplaintDetailDrawerComponent,
        CrmComplaintEditDrawerComponent,
    ],
    templateUrl: './support-complaint.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminSupportComplaintComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly complaintSrv = inject(ComplaintService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly statusTabs: StatusTab[] = [
        { value: null, label: 'All tickets', dot: '' },
        ...ALL_STATUSES.map(value => ({ value, label: STATUS[value].label, dot: DOT[STATUS[value].tone] })),
    ];
    readonly priorityOptions = PRIORITY_OPTIONS;
    readonly categoryOptions = CATEGORY_OPTIONS;
    readonly sortOptions = [
        { value: '-createdat', label: 'Newest first' },
        { value: '+createdat', label: 'Oldest first' },
        { value: '-priority', label: 'Highest priority' },
        { value: '-updatedat', label: 'Recently changed' },
    ];
    readonly skeletonRows = Array.from({ length: 8 });
    readonly Urgent = ComplaintPriority.Urgent;
    readonly subject = subjectOf;
    readonly ticket = ticketOf;
    readonly status = statusOf;
    readonly priority = priorityOf;
    readonly category = categoryOf;
    readonly raised = isRaised;
    readonly open = isOpen;
    readonly age = ageLabel;

    today = isoDate(new Date());
    query = '';
    statusFilter: ComplaintStatus | null = null;
    priorityFilter: ComplaintPriority | null = null;
    categoryFilter: ComplaintCategory | null = null;
    from: string | null = null;
    to: string | null = null;
    sort = '-createdat';
    page = 1;

    data: PaginationData<Complaint> | null = null;
    /** Tickets per status under the current search and filters; null while unknown. */
    counts: Record<ComplaintStatus, number> | null = null;
    loading = false;
    /** A keystroke is waiting for its debounced search. */
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    /** Tickets with a request in flight, and what it is. */
    busy = new Map<string, ComplaintBusy>();
    /** The owner being set, per ticket, while an assignment is in flight. */
    pendingOwner = new Map<string, string | null>();
    /** Bumped after an assignment is saved so the details close the hand-over form. */
    assignSaved = 0;

    selected: Complaint | null = null;
    editorOpen = false;
    editing: Complaint | null = null;
    /** Reopen the details after editing when the edit started there. */
    private returnToDetail = false;

    canCreate = false;
    canUpdate = false;
    canDelete = false;
    /** The signed-in user's name, used for "Assign to me". */
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
            .subscribe(u => this.me = u?.fullName?.trim().slice(0, COMPLAINT_LIMITS.assignedTo) || null);

        // switchMap drops the response of a search the user has already moved past; errors are caught per request
        // so the stream stays alive for the next search.
        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.complaintSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: this.filterFor(this.statusFilter),
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

        // One count per status, from the same search with the same filters. They are a guide: when they fail the
        // tabs simply leave them out.
        this.counts$
            .pipe(
                switchMap(() => forkJoin(ALL_STATUSES.map(s => this.complaintSrv.search({
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
                    ? Object.fromEntries(ALL_STATUSES.map((s, i) => [s, totals[i]!])) as Record<ComplaintStatus, number>
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
    get items(): Complaint[] {
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
        return !!this.searchTerm || this.priorityFilter !== null || this.categoryFilter !== null
            || ((!!this.from || !!this.to) && !this.rangeInvalid);
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `“${this.searchTerm}”` });
        if (this.priorityFilter !== null) chips.push({ kind: 'priority', label: `${PRIORITY[this.priorityFilter].label} priority` });
        if (this.categoryFilter !== null) chips.push({ kind: 'category', label: CATEGORY[this.categoryFilter] });
        if (!this.rangeInvalid && (this.from || this.to)) {
            const label = this.from && this.to ? `Logged ${this.shortDate(this.from)} – ${this.shortDate(this.to)}`
                : this.from ? `Logged from ${this.shortDate(this.from)}` : `Logged until ${this.shortDate(this.to!)}`;
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

    get totalCount(): number | null {
        return this.counts ? ALL_STATUSES.reduce((sum, s) => sum + this.counts![s], 0) : null;
    }

    /** Tickets still being worked (pending or in progress). */
    get openCount(): number | null {
        return this.counts ? OPEN_STATUSES.reduce((sum, s) => sum + this.counts![s], 0) : null;
    }

    get pendingCount(): number {
        return this.counts?.[ComplaintStatus.Pending] ?? 0;
    }

    get statusHint(): string {
        return this.statusFilter !== null ? STATUS[this.statusFilter].hint : '';
    }

    get emptyStatusText(): string {
        return this.statusFilter !== null ? EMPTY_STATUS[this.statusFilter] : '';
    }

    get busySelected(): ComplaintBusy | null {
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

    /** Reloads the list and the status counts. */
    refresh(): void {
        if (this.rangeInvalid) return;
        this.load();
        this.counts$.next();
    }

    countOf(tab: StatusTab): number | null {
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

    selectStatus(value: ComplaintStatus | null): void {
        if (value === this.statusFilter) return;
        this.statusFilter = value;
        this.page = 1;
        this.load();
    }

    onTabKey(event: KeyboardEvent, index: number): void {
        const last = this.statusTabs.length - 1;
        const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
            : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : event.key === 'Home' ? 0
            : event.key === 'End' ? last
            : -1;
        if (next < 0) return;
        event.preventDefault();
        this.selectStatus(this.statusTabs[next].value);
        this.host.querySelector<HTMLElement>(`#complaint-tab-${next}`)?.focus();
    }

    /** Search, priority, category and dates change what the counts cover too. */
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
        switch (chip.kind) {
            case 'search': this.clearSearch(); return;
            case 'priority': this.priorityFilter = null; break;
            case 'category': this.categoryFilter = null; break;
            default: this.from = null; this.to = null;
        }
        this.onFilterChange();
    }

    clearFilters(): void {
        this.query = '';
        this.priorityFilter = null;
        this.categoryFilter = null;
        this.from = null;
        this.to = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.refresh();
    }

    showAll(): void {
        this.statusFilter = null;
        this.clearFilters();
    }

    openDetail(c: Complaint): void {
        this.editorOpen = false;
        this.editing = null;
        this.selected = c;
    }

    openCreate(): void {
        if (!this.canCreate) return;
        this.returnToDetail = false;
        this.selected = null;
        this.editing = null;
        this.editorOpen = true;
    }

    openEdit(c: Complaint, fromDetail = false): void {
        if (!this.canUpdate || this.busy.has(c.id)) return;
        this.returnToDetail = fromDetail;
        this.selected = null;
        this.editing = c;
        this.editorOpen = true;
    }

    closeEditor(): void {
        const c = this.editing;
        this.editorOpen = false;
        this.editing = null;
        if (c && this.returnToDetail) this.selected = this.items.find(i => i.id === c.id) ?? c;
        this.returnToDetail = false;
    }

    onSaved({ complaint, created }: { complaint: Complaint; created: boolean }): void {
        this.toastSrv.success(`${ticketOf(complaint)} · ${subjectOf(complaint)}`, created ? 'Complaint logged' : 'Complaint updated');
        this.editorOpen = false;
        this.editing = null;
        this.returnToDetail = false;
        // Show the saved ticket so its next step is at hand.
        this.selected = complaint;
        this.refresh();
    }

    /** The usual forward step for an open ticket, offered on its row. */
    nextMove(c: Complaint): ComplaintMove | null {
        if (!isOpen(c)) return null;
        const m = movesOf(c)[0];
        return m && !m.confirm ? m : null;
    }

    /** Applies a status change, asking first before a ticket is closed. */
    move(c: Complaint, m: ComplaintMove): void {
        if (!this.canUpdate || this.busy.has(c.id)) return;
        if (!m.confirm) {
            this.applyMove(c, m);
            return;
        }
        const unresolved = c.status !== ComplaintStatus.Resolved;
        this.dialogSrv.confirm(
            `Close ${ticketOf(c)}? It leaves the open queue${unresolved ? ' without being marked resolved first' : ''}. You can reopen it from the Closed tab.`,
            () => this.applyMove(c, m),
            'Close ticket',
            'warning',
            'Close ticket',
            'Keep open',
        );
    }

    assign(c: Complaint, owner: string | null): void {
        if (!this.canUpdate || this.busy.has(c.id)) return;
        this.pendingOwner = new Map(this.pendingOwner).set(c.id, owner);
        this.save(c, 'assign', { assignedTo: owner }, saved => {
            this.assignSaved++;
            this.toastSrv.success(ticketOf(saved), owner ? `Assigned to ${owner}` : 'Ticket unassigned');
        });
    }

    setPriority(c: Complaint, priority: ComplaintPriority): void {
        if (!this.canUpdate || this.busy.has(c.id) || priority === c.priority) return;
        this.save(c, 'priority', { priority }, saved =>
            this.toastSrv.success(ticketOf(saved), `Priority set to ${PRIORITY[priority].label.toLowerCase()}`));
    }

    confirmDelete(c: Complaint): void {
        if (!this.canDelete || this.busy.has(c.id)) return;
        this.dialogSrv.confirm(
            `Delete ${ticketOf(c)} (“${subjectOf(c)}”)? The ticket will be removed from the list. To keep a record, close it instead.`,
            () => this.delete(c),
            'Delete complaint',
            'danger',
            'Delete ticket',
            'Keep ticket',
        );
    }

    trackById(_: number, c: Complaint): string {
        return c.id;
    }

    tabIndex(tab: StatusTab): number {
        return this.statusTabs.indexOf(tab);
    }
    // #endregion

    // #region Helpers
    private applyMove(c: Complaint, m: ComplaintMove): void {
        this.save(c, m.to, { status: m.to }, saved => this.toastSrv.success(ticketOf(saved), MOVED[m.to]));
    }

    /**
     * Saves a change to one ticket. The update replaces every field, so it starts from the stored ticket rather than
     * a possibly stale row, then reads the result back.
     */
    private save(c: Complaint, kind: ComplaintBusy, patch: Partial<UpdateComplaintRequest>, done: (saved: Complaint) => void): void {
        this.setBusy(c.id, kind);
        this.complaintSrv.search_by_id(c.id)
            .pipe(
                map(res => res?.success && res.data ? res.data : c),
                switchMap(fresh => this.complaintSrv.update(c.id, updateOf(fresh, patch))),
                // Saved even if the read-back fails; the refresh below catches up.
                switchMap(() => this.complaintSrv.search_by_id(c.id).pipe(catchError(() => of(null)))),
                finalize(() => {
                    this.setBusy(c.id, null);
                    if (kind === 'assign') {
                        const next = new Map(this.pendingOwner);
                        next.delete(c.id);
                        this.pendingOwner = next;
                    }
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    const saved = res?.success && res.data ? res.data : { ...c, ...patch } as Complaint;
                    done(saved);
                    if (this.selected?.id === c.id) this.selected = saved;
                    this.refresh();
                },
                // HTTP failures are reported by the global error toast; the ticket keeps its values and any typed
                // owner name stays in the hand-over form.
                error: () => undefined,
            });
    }

    private delete(c: Complaint): void {
        this.setBusy(c.id, 'delete');
        this.complaintSrv.delete(c.id)
            .pipe(finalize(() => this.setBusy(c.id, null)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    this.toastSrv.success(ticketOf(c), 'Complaint deleted');
                    if (this.selected?.id === c.id) this.selected = null;
                    // Step back a page when the last row on it was removed.
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.refresh();
                },
                // The global HTTP error toast reports the failure; the row stays.
                error: () => undefined,
            });
    }

    private filterFor(status: ComplaintStatus | null): ComplaintFilter {
        const range = !this.rangeInvalid;
        return {
            start: range ? this.from : null,
            end: range ? this.to : null,
            status,
            priority: this.priorityFilter,
            category: this.categoryFilter,
        };
    }

    private setBusy(id: string, value: ComplaintBusy | null): void {
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
        // Actions follow the permissions the complaint API enforces.
        this.canCreate = can(Permissions.Crm.ComplaintCreate);
        this.canUpdate = can(Permissions.Crm.ComplaintUpdate);
        this.canDelete = can(Permissions.Crm.ComplaintDelete);
    }
    // #endregion
}
