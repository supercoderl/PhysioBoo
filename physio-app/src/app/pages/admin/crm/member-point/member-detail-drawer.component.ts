import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooIconComponent,
    BooPaginationComponent,
    BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { MemberService } from '../../../../services/admin/member.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { PaginationData } from '../../../../shared/types/common';
import { Member } from '../../../../shared/types/member.types';
import { PointTransaction } from '../../../../shared/types/transaction.types';
import { memberName, statusOf, tierToneOf } from './member.utils';

type LedgerType = PointTransaction['type'] | null;

const LEDGER_PAGE_SIZE = 10;

/**
 * One member: balance, membership and the point ledger (POST /api/members/{id}/transactions/search). The server
 * returns the ledger newest first and filters only by type, so that is the only control. Each entry carries the
 * balance it left behind, so no totals are worked out here from a single page.
 */
@Component({
    selector: 'crm-member-detail-drawer',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        DatePipe,
        DecimalPipe,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooStatusBadgeComponent,
        BooPaginationComponent,
        BooEmptyStateComponent,
        BooErrorStateComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="!!member" (close)="close.emit()">
            <div
                *ngIf="member as m"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-detail-title"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">{{ m.memberNumber || 'Member' }}</p>
                        <h2 id="member-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(m) }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-1.5">
                            <boo-status-badge dotted [label]="status(m).label" [tone]="status(m).tone" />
                            <boo-status-badge [label]="m.membershipType" [tone]="tierTone(m)" />
                        </div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close member" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto flex flex-col" custom-scrollbar>
                    <!-- Balance: the one figure this drawer is about -->
                    <section class="px-6 py-5 border-b border-rowDivider" aria-labelledby="md-balance">
                        <div class="flex flex-wrap items-end justify-between gap-4">
                            <div>
                                <h3 id="md-balance" class="m-0 text-xs font-medium text-secondary">Available balance</h3>
                                <p class="m-0 mt-1 flex items-baseline gap-1.5">
                                    <span class="text-[32px] leading-9 font-semibold tracking-tight text-regular tabular-nums">{{ m.points | number }}</span>
                                    <span class="text-sm font-medium text-secondary">pts</span>
                                </p>
                            </div>
                            <div *ngIf="canAdd || canRedeem" class="flex flex-wrap items-center gap-2">
                                <button *ngIf="canRedeem" boo-button variant="secondary" size="sm" aria-haspopup="dialog" [disabled]="!isActive || busy" (click)="redeem.emit(m)">
                                    <physio-icon name="gift" [size]="15" aria-hidden="true" />Redeem reward
                                </button>
                                <button *ngIf="canAdd" boo-button variant="primary" size="sm" aria-haspopup="dialog" [disabled]="!isActive || busy" (click)="addPoints.emit(m)">
                                    <physio-icon name="plus" [size]="15" aria-hidden="true" />Add points
                                </button>
                            </div>
                        </div>
                        <p *ngIf="!isActive && (canAdd || canRedeem)" class="m-0 mt-3 flex items-start gap-1.5 text-xs text-secondary">
                            <physio-icon name="info" [size]="14" class="flex-none mt-px" aria-hidden="true" />
                            Points can't change while this member is {{ status(m).label.toLowerCase() }}.<ng-container *ngIf="canUpdate"> Reactivate the membership to add or redeem points.</ng-container>
                        </p>
                    </section>

                    <!-- Membership and contact -->
                    <section class="px-6 py-5 border-b border-rowDivider" aria-labelledby="md-profile">
                        <h3 id="md-profile" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Membership</h3>
                        <dl class="m-0 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Joined</dt>
                                <dd class="m-0 font-medium text-regular">{{ (m.joinDate | date: 'd MMM y') || '—' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Last visit</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="m.lastVisit" [class.text-placeholder]="!m.lastVisit">{{ (m.lastVisit | date: 'd MMM y') || 'None yet' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Phone</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ m.phone || '—' }}</dd>
                            </div>
                            <div class="col-span-2 sm:col-span-3 min-w-0">
                                <dt class="text-xs text-secondary">Email</dt>
                                <dd class="m-0 font-medium text-regular break-all">{{ m.email || '—' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <!-- Ledger -->
                    <section class="flex-1 flex flex-col min-h-[320px]" aria-labelledby="md-ledger">
                        <div class="px-6 pt-5 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h3 id="md-ledger" class="m-0 text-sm font-semibold text-regular">Point history</h3>
                                <p class="m-0 mt-0.5 text-xs text-secondary">Newest first<ng-container *ngIf="ledger"> · {{ ledger.totalCount }} {{ ledger.totalCount === 1 ? 'entry' : 'entries' }}{{ type ? ' shown' : '' }}</ng-container></p>
                            </div>
                            <div class="flex items-center gap-0.5 p-0.5 rounded-lg bg-body" role="tablist" aria-label="Entry type">
                                <button
                                    *ngFor="let t of typeTabs; let i = index"
                                    type="button"
                                    role="tab"
                                    [id]="'md-type-' + i"
                                    aria-controls="md-ledger-list"
                                    [attr.aria-selected]="t.value === type"
                                    [attr.tabindex]="t.value === type ? 0 : -1"
                                    class="px-3 h-7 rounded-md border-0 text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    [ngClass]="t.value === type ? 'bg-surface text-regular font-semibold shadow-sm' : 'bg-transparent text-secondary font-medium hover:text-regular'"
                                    (click)="selectType(t.value)"
                                    (keydown)="onTypeKey($event, i)"
                                >{{ t.label }}</button>
                            </div>
                        </div>

                        <div id="md-ledger-list" role="tabpanel" class="flex-1 flex flex-col mt-3" [attr.aria-busy]="loading">
                            <table *ngIf="entries.length; else noEntriesTpl" class="w-full border-collapse text-sm" [class.opacity-60]="loading">
                                <caption class="sr-only">Point history of {{ name(m) }}, page {{ page }} of {{ totalPages }}</caption>
                                <thead>
                                    <tr class="text-left text-xs font-medium text-secondary border-y border-rowDivider">
                                        <th scope="col" class="pl-6 pr-3 py-2 font-medium whitespace-nowrap">Date</th>
                                        <th scope="col" class="px-3 py-2 font-medium">Entry</th>
                                        <th scope="col" class="px-3 py-2 font-medium text-right whitespace-nowrap">Points</th>
                                        <th scope="col" class="pl-3 pr-6 py-2 font-medium text-right whitespace-nowrap hidden sm:table-cell">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr *ngFor="let t of entries; trackBy: trackById" class="border-b border-rowDivider last:border-b-0 align-top">
                                        <td class="pl-6 pr-3 py-3 whitespace-nowrap">
                                            <div class="text-regular tabular-nums">{{ t.date | date: 'd MMM y' }}</div>
                                            <div class="mt-0.5 text-xs text-secondary tabular-nums">{{ t.date | date: 'HH:mm' }}</div>
                                        </td>
                                        <td class="px-3 py-3 min-w-0 max-w-0 w-full">
                                            <div class="text-regular break-words">{{ t.description || (t.type === 'earned' ? 'Points added' : 'Points redeemed') }}</div>
                                            <div class="mt-0.5 text-xs text-secondary truncate" [title]="t.code + (t.rewardTitle ? ' · ' + t.rewardTitle : '')">
                                                <span class="tabular-nums">{{ t.code }}</span><ng-container *ngIf="t.rewardTitle"><span aria-hidden="true"> · </span>Reward: {{ t.rewardTitle }}</ng-container>
                                            </div>
                                        </td>
                                        <td class="px-3 py-3 text-right whitespace-nowrap">
                                            <span class="font-semibold tabular-nums" [class.text-emerald-700]="t.type === 'earned'" [class.text-regular]="t.type !== 'earned'">
                                                <span aria-hidden="true">{{ t.type === 'earned' ? '+' : '−' }}</span>{{ t.points | number }}
                                            </span>
                                            <span class="sr-only">{{ t.type === 'earned' ? 'points added' : 'points redeemed' }}</span>
                                            <div class="mt-0.5 text-xs text-secondary tabular-nums sm:hidden">bal. {{ t.balanceAfter | number }}</div>
                                        </td>
                                        <td class="pl-3 pr-6 py-3 text-right whitespace-nowrap text-secondary tabular-nums hidden sm:table-cell">{{ t.balanceAfter | number }}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <ng-template #noEntriesTpl>
                                <div *ngIf="loading && !ledger; else ledgerStateTpl" class="flex flex-col border-t border-rowDivider" aria-hidden="true">
                                    <div *ngFor="let _ of skeletonRows" class="flex items-center gap-4 px-6 py-3.5 border-b border-rowDivider">
                                        <div class="w-16 h-3.5 rounded bg-rowDivider animate-pulse"></div>
                                        <div class="flex-1 h-3.5 rounded bg-rowDivider animate-pulse"></div>
                                        <div class="w-14 h-3.5 rounded bg-rowDivider animate-pulse"></div>
                                    </div>
                                    <span class="sr-only" role="status">Loading point history…</span>
                                </div>
                                <ng-template #ledgerStateTpl>
                                    <div class="flex-1 flex items-center justify-center px-6 py-8 border-t border-rowDivider">
                                        <boo-empty-state
                                            *ngIf="error === 'forbidden'"
                                            icon="lock"
                                            [headingLevel]="3"
                                            title="You don't have access to point history"
                                            description="Ask an administrator for permission to view member points."
                                        />
                                        <boo-error-state
                                            *ngIf="error === 'failed'"
                                            icon="cloud-off"
                                            [headingLevel]="3"
                                            title="We couldn't load the point history"
                                            description="Check your connection and try again."
                                            retryLabel="Try again"
                                            (retry)="load()"
                                        />
                                        <ng-container *ngIf="!error">
                                            <boo-empty-state
                                                *ngIf="type; else noHistoryTpl"
                                                icon="history"
                                                [headingLevel]="3"
                                                [title]="type === 'earned' ? 'No points added yet' : 'No rewards redeemed yet'"
                                                description="Switch to All to see every entry."
                                            />
                                            <ng-template #noHistoryTpl>
                                                <boo-empty-state
                                                    icon="history"
                                                    [headingLevel]="3"
                                                    title="No point history yet"
                                                    [description]="m.points ? 'This member has a balance but no entries yet, for example points carried over when they enrolled.' : 'Points added or redeemed for this member will be listed here.'"
                                                />
                                            </ng-template>
                                        </ng-container>
                                    </div>
                                </ng-template>
                            </ng-template>
                        </div>

                        <p *ngIf="ledger && entries.length && error === 'failed'" class="m-0 px-6 py-2 flex items-center gap-1.5 text-xs text-danger" role="alert">
                            <physio-icon name="circle-alert" [size]="14" aria-hidden="true" />Couldn't load that page.
                            <button type="button" boo-button variant="link" size="sm" (click)="load()">Try again</button>
                        </p>

                        <div *ngIf="ledger && ledger.totalCount > 0" class="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-t border-rowDivider">
                            <p class="m-0 text-xs text-secondary tabular-nums" aria-live="polite">Showing {{ firstShown }}–{{ lastShown }} of {{ ledger.totalCount }}</p>
                            <boo-pagination *ngIf="totalPages > 1" [page]="page" [totalPages]="totalPages" (pageChange)="onPageChange($event)" />
                        </div>
                    </section>
                </div>

                <footer *ngIf="canUpdate || canDelete" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" (click)="remove.emit(m)">
                        <physio-icon name="trash" [size]="15" aria-hidden="true" />Remove member
                    </button>
                    <button *ngIf="canUpdate" boo-button variant="secondary" size="sm" aria-haspopup="dialog" [disabled]="busy" (click)="edit.emit(m)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit membership
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CrmMemberDetailDrawerComponent implements OnChanges {
    @Input() member: Member | null = null;
    /** Bumped by the page after a points change so the ledger reloads from its first page. */
    @Input() ledgerVersion = 0;
    @Input() canAdd = false;
    @Input() canRedeem = false;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A change to this member is in flight. */
    @Input() busy = false;
    @Output() close = new EventEmitter<void>();
    @Output() addPoints = new EventEmitter<Member>();
    @Output() redeem = new EventEmitter<Member>();
    @Output() edit = new EventEmitter<Member>();
    @Output() remove = new EventEmitter<Member>();

    private readonly memberSrv = inject(MemberService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;

    readonly typeTabs: { value: LedgerType; label: string }[] = [
        { value: null, label: 'All' },
        { value: 'earned', label: 'Added' },
        { value: 'redeemed', label: 'Redeemed' },
    ];
    readonly skeletonRows = Array.from({ length: 5 });
    readonly name = memberName;
    readonly status = statusOf;
    readonly tierTone = tierToneOf;

    type: LedgerType = null;
    page = 1;
    ledger: PaginationData<PointTransaction> | null = null;
    loading = false;
    error: 'forbidden' | 'failed' | null = null;

    private readonly load$ = new Subject<string>();

    constructor() {
        // switchMap drops a page the user has already moved past.
        this.load$
            .pipe(
                switchMap(memberId => {
                    this.loading = true;
                    return this.memberSrv.transactions(memberId, {
                        pageNumber: this.page,
                        pageSize: LEDGER_PAGE_SIZE,
                        filter: { type: this.type },
                    }).pipe(
                        map(res => ({ memberId, res, err: null as HttpErrorResponse | null })),
                        catchError((err: HttpErrorResponse) => of({ memberId, res: null, err })),
                        finalize(() => this.loading = false),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe(({ memberId, res, err }) => {
                if (memberId !== this.member?.id) return;
                if (err || !res?.success || !res.data) {
                    this.error = err?.status === 403 ? 'forbidden' : 'failed';
                    return;
                }
                this.error = null;
                this.ledger = { ...res.data, items: res.data.items ?? [] };
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        const memberChange = changes['member'];
        const nextId = this.member?.id;
        const prevId = (memberChange?.previousValue as Member | null)?.id;
        if (memberChange && nextId !== prevId) {
            // Another member (or none): start from a clean, unfiltered ledger.
            this.type = null;
            this.reset();
            if (nextId) this.load();
            return;
        }
        if (changes['ledgerVersion'] && !changes['ledgerVersion'].firstChange && nextId) {
            this.page = 1;
            this.load();
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.member) this.close.emit();
    }

    get isActive(): boolean {
        return this.member?.status === 'active';
    }

    get entries(): PointTransaction[] {
        return this.ledger?.items ?? [];
    }

    get totalPages(): number {
        return Math.max(1, this.ledger?.totalPages ?? Math.ceil((this.ledger?.totalCount ?? 0) / LEDGER_PAGE_SIZE));
    }

    get firstShown(): number {
        return this.entries.length ? (this.page - 1) * LEDGER_PAGE_SIZE + 1 : 0;
    }

    get lastShown(): number {
        return (this.page - 1) * LEDGER_PAGE_SIZE + this.entries.length;
    }

    load(): void {
        if (this.member) this.load$.next(this.member.id);
    }

    selectType(type: LedgerType): void {
        if (type === this.type) return;
        this.type = type;
        this.page = 1;
        this.ledger = null;
        this.load();
    }

    onTypeKey(event: KeyboardEvent, index: number): void {
        const last = this.typeTabs.length - 1;
        const next = event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
            : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
            : event.key === 'Home' ? 0
            : event.key === 'End' ? last
            : null;
        if (next === null) return;
        event.preventDefault();
        this.selectType(this.typeTabs[next].value);
        // The drawer is re-parented to <body>, so look the tab up from this component's own element.
        this.host.ownerDocument.getElementById(`md-type-${next}`)?.focus();
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.page) return;
        this.page = page;
        this.load();
    }

    trackById(_: number, t: PointTransaction): string {
        return t.id;
    }

    private reset(): void {
        this.page = 1;
        this.ledger = null;
        this.error = null;
    }
}
