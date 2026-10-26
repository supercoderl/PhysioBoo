import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
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
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { MemberService } from '../../../../services/admin/member.service';
import { RewardService } from '../../../../services/admin/reward.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { PaginationData } from '../../../../shared/types/common';
import { Member, MemberStats, MemberStatus, MembershipTier } from '../../../../shared/types/member.types';
import { Patient } from '../../../../shared/types/patient.types';
import { Reward } from '../../../../shared/types/reward.types';
import { CrmMemberDetailDrawerComponent } from './member-detail-drawer.component';
import { CrmMemberEditDrawerComponent } from './member-edit-drawer.component';
import { CrmMemberEnrollDrawerComponent } from './member-enroll-drawer.component';
import { CrmMemberPointsDrawerComponent, PointsMode } from './member-points-drawer.component';
import { CrmRewardsCatalogDrawerComponent } from './rewards-catalog-drawer.component';
import { STATUS, STATUSES, TIER_OPTIONS, cleanMemberSearch, memberInitials, memberName, statusOf, tierToneOf } from './member.utils';

type LoadError = 'forbidden' | 'failed';
type RewardsState = 'idle' | 'loading' | 'ready' | 'failed' | 'forbidden';

interface FilterChip extends BooFilterChip {
    kind: 'search' | 'tier';
}

interface StatusTab {
    value: MemberStatus | null;
    label: string;
    dot: string;
}

const PAGE_SIZE = 20;
const REWARDS_SIZE = 100;

/**
 * Loyalty members and their points (POST /api/members/search). The server searches member number, name, email and
 * phone, filters by one tier and one status, and sorts by join date, balance, first name or member number — so those
 * are the only controls. Point history exists only per member, so it lives in the member drawer rather than in a
 * page-wide ledger. The programme figures come from GET /api/members/stats and are not affected by the filters.
 */
@Component({
    selector: 'admin-member-point',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        DecimalPipe,
        FormsModule,
        BooButtonComponent,
        BooIconComponent,
        BooSearchFieldComponent,
        BooFilterChipsComponent,
        BooSelectComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        BooInlineErrorComponent,
        CrmMemberDetailDrawerComponent,
        CrmMemberPointsDrawerComponent,
        CrmMemberEditDrawerComponent,
        CrmMemberEnrollDrawerComponent,
        CrmRewardsCatalogDrawerComponent,
    ],
    templateUrl: './member-point.component.html',
    host: { class: 'flex flex-col min-h-full' },
})
export class AdminMemberPointComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    private readonly memberSrv = inject(MemberService);
    private readonly rewardSrv = inject(RewardService);
    private readonly authSrv = inject(AuthService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly sortOptions = [
        { value: '-joindate', label: 'Recently joined' },
        { value: '-points', label: 'Highest balance' },
        { value: '+points', label: 'Lowest balance' },
        { value: '+name', label: 'First name (A–Z)' },
        { value: '+membernumber', label: 'Member no.' },
    ];
    readonly tierOptions = TIER_OPTIONS;
    readonly statusTabs: StatusTab[] = [
        { value: null, label: 'All members', dot: '' },
        { value: 'active', label: STATUS.active.label, dot: 'bg-emerald-500' },
        { value: 'inactive', label: STATUS.inactive.label, dot: 'bg-gray-400' },
        { value: 'suspended', label: STATUS.suspended.label, dot: 'bg-rose-500' },
    ];
    readonly skeletonRows = Array.from({ length: 8 });
    readonly name = memberName;
    readonly initials = memberInitials;
    readonly status = statusOf;
    readonly tierTone = tierToneOf;

    query = '';
    tier: MembershipTier | null = null;
    statusFilter: MemberStatus | null = null;
    sort = '-joindate';
    page = 1;

    data: PaginationData<Member> | null = null;
    loading = false;
    searchPending = false;
    loadError: LoadError | null = null;
    refreshErrorState: BooInlineErrorState = 'default';
    counts: Record<MemberStatus, number> | null = null;
    stats: MemberStats | null = null;
    statsFailed = false;
    /** Members with a removal in flight; their actions are disabled. */
    busyIds = new Set<string>();

    selected: Member | null = null;
    ledgerVersion = 0;
    pointsTarget: Member | null = null;
    pointsMode: PointsMode = 'add';
    editing: Member | null = null;
    enrolling = false;
    rewardsOpen = false;
    /** Reopen the member drawer once a points change or edit started there is finished. */
    private returnToMember = false;

    rewards: Reward[] = [];
    rewardsTotal = 0;
    rewardsState: RewardsState = 'idle';

    canEnroll = false;
    canUpdate = false;
    canDelete = false;
    canAdd = false;
    canRedeem = false;
    canReadRewards = false;

    private readonly load$ = new Subject<void>();
    private readonly counts$ = new Subject<void>();
    private readonly query$ = new Subject<string>();
    private lastSearched = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    ngOnInit(): void {
        this.authSrv.permissions$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(perms => this.applyPermissions(perms ?? []));

        this.load$
            .pipe(
                switchMap(() => {
                    this.loading = true;
                    return this.memberSrv.search({
                        pageNumber: this.page,
                        pageSize: PAGE_SIZE,
                        search: this.searchTerm,
                        sort: this.sort,
                        filter: { tier: this.tier, status: this.statusFilter },
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
                    this.refreshErrorState = this.data && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
                    this.loadError = err?.status === 403 ? 'forbidden' : 'failed';
                    return;
                }
                this.data = { ...res.data, items: res.data.items ?? [] };
                this.loadError = null;
                this.refreshErrorState = 'default';
                // Keep an open member in step with the refreshed row.
                const open = this.selected;
                if (open) this.selected = this.data.items.find(m => m.id === open.id) ?? open;
            });

        // Status tab counts under the current search and tier: one single-row search per status.
        this.counts$
            .pipe(
                switchMap(() => forkJoin(STATUSES.map(status => this.memberSrv.search({
                    pageNumber: 1,
                    pageSize: 1,
                    search: this.searchTerm,
                    filter: { tier: this.tier, status },
                }).pipe(
                    map(res => res?.success ? res.data?.totalCount ?? null : null),
                    catchError(() => of(null)),
                )))),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(totals => {
                this.counts = totals.every(t => t !== null)
                    ? Object.fromEntries(STATUSES.map((s, i) => [s, totals[i]!])) as Record<MemberStatus, number>
                    : null;
            });

        this.query$
            .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                const term = this.searchTerm;
                this.searchPending = false;
                if (term === this.lastSearched) return;
                this.lastSearched = term;
                this.page = 1;
                this.load();
                this.counts$.next();
            });

        this.refresh();
    }
    // #endregion

    // #region Getters
    get items(): Member[] {
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
        return cleanMemberSearch(this.query);
    }

    get hasFilters(): boolean {
        return !!this.searchTerm || !!this.tier;
    }

    get chips(): FilterChip[] {
        const chips: FilterChip[] = [];
        if (this.searchTerm) chips.push({ kind: 'search', label: `“${this.searchTerm}”` });
        if (this.tier) chips.push({ kind: 'tier', label: `${this.tier} tier` });
        return chips;
    }

    get sortLabel(): string {
        return this.sortOptions.find(o => o.value === this.sort)?.label.toLowerCase() ?? '';
    }

    get activeRate(): number | null {
        const s = this.stats;
        return s && s.totalMembers > 0 ? Math.round((s.activeMembers / s.totalMembers) * 100) : null;
    }

    get emptyStatusLabel(): string {
        return this.statusFilter ? STATUS[this.statusFilter].label.toLowerCase() + ' ' : '';
    }
    // #endregion

    // #region Methods
    /** Reloads the list, the tab counts and the programme figures. */
    refresh(): void {
        this.load();
        this.counts$.next();
        this.loadStats();
    }

    load(): void {
        if (this.data && this.loadError === 'failed') this.refreshErrorState = 'retrying';
        this.load$.next();
    }

    countOf(tab: StatusTab): number | null {
        if (!this.counts) return null;
        return tab.value === null ? STATUSES.reduce((sum, s) => sum + this.counts![s], 0) : this.counts[tab.value];
    }

    selectStatus(value: MemberStatus | null): void {
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
            : null;
        if (next === null) return;
        event.preventDefault();
        this.selectStatus(this.statusTabs[next].value);
        this.host.querySelector<HTMLElement>(`#member-tab-${next}`)?.focus();
    }

    onQueryChange(): void {
        this.searchPending = cleanMemberSearch(this.query) !== this.lastSearched;
        this.query$.next(this.query);
    }

    clearSearch(): void {
        this.query = '';
        this.onQueryChange();
    }

    onTierChange(): void {
        this.page = 1;
        this.load();
        this.counts$.next();
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
        this.tier = null;
        this.onTierChange();
    }

    clearFilters(): void {
        this.query = '';
        this.tier = null;
        this.searchPending = false;
        this.lastSearched = '';
        this.page = 1;
        this.load();
        this.counts$.next();
    }

    openMember(m: Member): void {
        this.selected = m;
    }

    openPoints(m: Member, mode: PointsMode, fromMember = false): void {
        if (mode === 'add' ? !this.canAdd : !this.canRedeem) return;
        if (m.status !== 'active') return;
        this.returnToMember = fromMember;
        this.selected = null;
        this.pointsMode = mode;
        this.pointsTarget = m;
        if (mode === 'redeem') this.ensureRewards();
    }

    closePoints(): void {
        const m = this.pointsTarget;
        this.pointsTarget = null;
        if (m && this.returnToMember) this.selected = this.items.find(i => i.id === m.id) ?? m;
        this.returnToMember = false;
    }

    onPointsDone(e: { member: Member; summary: string }): void {
        this.toastSrv.success(e.summary, this.pointsMode === 'add' ? 'Points added' : 'Reward redeemed');
        this.returnToMember = true;
        this.closePoints();
        this.afterMemberChange(e.member.id);
    }

    openEdit(m: Member, fromMember = false): void {
        if (!this.canUpdate) return;
        this.returnToMember = fromMember;
        this.selected = null;
        this.editing = m;
    }

    closeEdit(): void {
        const m = this.editing;
        this.editing = null;
        if (m && this.returnToMember) this.selected = this.items.find(i => i.id === m.id) ?? m;
        this.returnToMember = false;
    }

    onSaved(m: Member): void {
        if (this.data) this.data = { ...this.data, items: this.data.items.map(i => i.id === m.id ? m : i) };
        this.toastSrv.success(`${memberName(m)} · ${m.membershipType}, ${STATUS[m.status].label.toLowerCase()}`, 'Membership updated');
        this.editing = m;
        this.closeEdit();
        this.afterMemberChange(m.id, false);
    }

    openEnroll(): void {
        if (this.canEnroll) this.enrolling = true;
    }

    onEnrolled(e: { id: string; patient: Patient }): void {
        this.enrolling = false;
        this.toastSrv.success(`${e.patient.fullName?.trim() || e.patient.patientNumber} is now a member.`, 'Member enrolled');
        this.refresh();
        // Open the new member so their balance (carried-over points included) is visible right away.
        this.memberSrv.search_by_id(e.id)
            .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                if (res?.success && res.data && !this.selected && !this.pointsTarget && !this.editing) this.selected = res.data;
            });
    }

    openRewards(): void {
        if (!this.canReadRewards) return;
        this.rewardsOpen = true;
        this.ensureRewards();
    }

    retryRewards(): void {
        this.rewardsState = 'idle';
        this.ensureRewards();
    }

    confirmRemove(m: Member): void {
        if (!this.canDelete || this.busyIds.has(m.id)) return;
        this.dialogSrv.confirm(
            `Remove ${memberName(m)} (${m.memberNumber}) from the loyalty programme? Their ${m.points.toLocaleString()}-point balance and history are kept on record, but they will no longer be listed here.`,
            () => this.remove(m),
            'Remove member',
            'danger',
            'Remove member',
            'Keep member',
        );
    }

    addPointsLabel(m: Member): string {
        return m.status === 'active'
            ? `Add points to ${memberName(m)}`
            : `Points can't be added while ${memberName(m)} is ${STATUS[m.status].label.toLowerCase()}`;
    }

    trackById(_: number, m: Member): string {
        return m.id;
    }
    // #endregion

    // #region Helpers
    /** Refresh what a balance or membership change affects: the member itself, the list, counts and figures. */
    private afterMemberChange(memberId: string, ledgerChanged = true): void {
        if (ledgerChanged) this.ledgerVersion++;
        this.memberSrv.search_by_id(memberId)
            .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                const fresh = res?.success ? res.data : null;
                if (!fresh) return;
                if (this.selected?.id === memberId) this.selected = fresh;
                if (this.data) this.data = { ...this.data, items: this.data.items.map(i => i.id === memberId ? fresh : i) };
            });
        this.load();
        this.counts$.next();
        this.loadStats();
    }

    private remove(m: Member): void {
        this.busyIds = new Set(this.busyIds).add(m.id);
        this.memberSrv.delete(m.id)
            .pipe(
                finalize(() => {
                    const next = new Set(this.busyIds);
                    next.delete(m.id);
                    this.busyIds = next;
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    if (res && res.success === false) return;
                    this.toastSrv.success(`${memberName(m)} · ${m.memberNumber}`, 'Member removed');
                    if (this.selected?.id === m.id) this.selected = null;
                    if (this.items.length === 1 && this.page > 1) this.page--;
                    this.refresh();
                },
                // The global HTTP error toast reports the failure; the member stays.
                error: () => undefined,
            });
    }

    private loadStats(): void {
        this.memberSrv.stats()
            .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe(res => {
                if (res?.success && res.data) {
                    this.stats = res.data;
                    this.statsFailed = false;
                } else {
                    this.statsFailed = true;
                }
            });
    }

    /** The rewards catalog, loaded once per visit when redeeming or browsing; retried after a failure. */
    private ensureRewards(): void {
        if (this.rewardsState === 'loading' || this.rewardsState === 'ready') return;
        this.rewardsState = 'loading';
        this.rewardSrv.search({
            pageNumber: 1,
            pageSize: REWARDS_SIZE,
            sort: '+pointsrequired',
            filter: { category: null, available: null },
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (!res?.success || !res.data) {
                        this.rewardsState = 'failed';
                        return;
                    }
                    this.rewards = res.data.items ?? [];
                    this.rewardsTotal = res.data.totalCount ?? this.rewards.length;
                    this.rewardsState = 'ready';
                },
                error: (err: HttpErrorResponse) => this.rewardsState = err?.status === 403 ? 'forbidden' : 'failed',
            });
    }

    private applyPermissions(perms: string[]): void {
        const can = (code: string) => perms.includes(code);
        // Actions follow the permissions the member, reward and patient APIs enforce.
        this.canEnroll = can(Permissions.Crm.MemberCreate) && can(Permissions.Reception.PatientRead);
        this.canUpdate = can(Permissions.Crm.MemberUpdate);
        this.canDelete = can(Permissions.Crm.MemberDelete);
        this.canAdd = can(Permissions.Crm.PointAdd);
        this.canReadRewards = can(Permissions.Crm.RewardRead);
        this.canRedeem = can(Permissions.Crm.PointRedeem) && this.canReadRewards;
    }
    // #endregion
}
