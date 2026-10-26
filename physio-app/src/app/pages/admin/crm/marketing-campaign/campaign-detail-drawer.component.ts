import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BooButtonComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Campaign } from '../../../../shared/types/campaign.types';
import { CampaignTransition, budgetUse, channelOf, parseIsoDate, statusOf, timingOf, transitionsOf } from './campaign.utils';

/**
 * Read-only view of one campaign: lifecycle moves, goal and audience, schedule, budget, recorded results and the brief.
 * Lifecycle moves and edits are handed to the list, which owns the requests.
 */
@Component({
    selector: 'crm-campaign-detail-drawer',
    standalone: true,
    imports: [NgIf, NgFor, NgClass, DatePipe, DecimalPipe, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="!!campaign" (close)="close.emit()">
            <div
                *ngIf="campaign as c"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="campaign-detail-title"
                [attr.aria-busy]="busy"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 flex items-center gap-1.5 text-xs font-medium text-secondary">
                            <span class="tabular-nums">{{ c.code }}</span>
                            <span aria-hidden="true">·</span>
                            <physio-icon [name]="channel(c).icon" [size]="13" aria-hidden="true" />{{ channel(c).label }}
                        </p>
                        <h2 id="campaign-detail-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ c.name }}</h2>
                        <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <boo-status-badge dotted [label]="status(c).label" [tone]="status(c).tone" />
                            <span *ngIf="timing(c) as t" class="text-xs" [class.text-danger]="t.overdue" [class.text-secondary]="!t.overdue">{{ t.text }}</span>
                        </div>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close campaign details" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <!-- Lifecycle -->
                <div *ngIf="canUpdate && moves(c).length" class="flex-none px-6 py-3 border-b border-rowDivider bg-body/60">
                    <p class="m-0 mb-2 text-xs font-medium text-secondary">Move this campaign</p>
                    <div class="flex flex-wrap items-center gap-2" role="group" aria-label="Change campaign status">
                        <button
                            *ngFor="let t of moves(c); let first = first"
                            type="button"
                            boo-button
                            size="sm"
                            [variant]="first && !t.danger ? 'primary' : t.danger ? 'ghost' : 'secondary'"
                            [ngClass]="t.danger ? '!text-danger ml-auto' : ''"
                            [disabled]="busy"
                            [loading]="busy && pendingStatus === t.to"
                            (click)="transition.emit(t)"
                        >
                            <physio-icon *ngIf="!(busy && pendingStatus === t.to)" [name]="t.icon" [size]="15" aria-hidden="true" />{{ t.label }}
                        </button>
                    </div>
                </div>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <section aria-labelledby="cd-plan">
                        <h3 id="cd-plan" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Goal and audience</h3>
                        <p class="m-0 text-sm font-medium break-words" [class.text-regular]="c.goal" [class.text-placeholder]="!c.goal">{{ c.goal || 'No goal set' }}</p>
                        <div class="mt-3 flex items-start gap-2 text-sm">
                            <physio-icon name="users" [size]="16" class="flex-none mt-0.5 text-secondary" aria-hidden="true" />
                            <div class="min-w-0">
                                <p class="m-0 font-medium" [class.text-regular]="c.audienceSegmentName" [class.text-placeholder]="!c.audienceSegmentName">
                                    {{ c.audienceSegmentName || (c.audienceSegmentId ? 'Unknown segment' : 'No specific audience') }}
                                </p>
                                <p *ngIf="segmentCriteria" class="m-0 mt-0.5 text-xs text-secondary">{{ segmentCriteria }}</p>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="cd-schedule" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-schedule" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Schedule</h3>
                        <dl class="m-0 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Starts</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="c.startDate" [class.text-placeholder]="!c.startDate">{{ (date(c.startDate) | date: 'd MMM y') || 'Not set' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Ends</dt>
                                <dd class="m-0 font-medium" [class.text-regular]="c.endDate" [class.text-placeholder]="!c.endDate">{{ (date(c.endDate) | date: 'd MMM y') || 'Not set' }}</dd>
                            </div>
                            <div *ngIf="days(c) as d">
                                <dt class="text-xs text-secondary">Runs for</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ d }} {{ d === 1 ? 'day' : 'days' }}</dd>
                            </div>
                        </dl>
                    </section>

                    <section aria-labelledby="cd-budget" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-budget" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Budget</h3>
                        <dl class="m-0 grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt class="text-xs text-secondary">Budget</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ c.budget | number: '1.0-2' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">Spent</dt>
                                <dd class="m-0 font-medium text-regular tabular-nums">{{ c.spent | number: '1.0-2' }}</dd>
                            </div>
                            <div>
                                <dt class="text-xs text-secondary">{{ c.budget - c.spent < 0 ? 'Over budget' : 'Remaining' }}</dt>
                                <dd class="m-0 font-medium tabular-nums" [class.text-danger]="c.budget - c.spent < 0" [class.text-regular]="c.budget - c.spent >= 0">{{ abs(c.budget - c.spent) | number: '1.0-2' }}</dd>
                            </div>
                        </dl>
                        <div *ngIf="use(c) !== null" class="mt-3">
                            <div
                                class="h-1.5 rounded-full bg-rowDivider overflow-hidden"
                                role="meter"
                                aria-label="Budget used"
                                aria-valuemin="0"
                                aria-valuemax="100"
                                [attr.aria-valuenow]="min(use(c)!, 100)"
                            >
                                <div class="h-full rounded-full" [class.bg-primary]="use(c)! <= 100" [class.bg-danger]="use(c)! > 100" [style.width.%]="min(use(c)!, 100)"></div>
                            </div>
                            <p class="m-0 mt-1 text-xs text-secondary tabular-nums">{{ use(c) }}% of budget used</p>
                        </div>
                    </section>

                    <section aria-labelledby="cd-results" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-results" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Recorded results</h3>
                        <p *ngIf="!c.reach && !c.conversions; else resultsTpl" class="m-0 text-sm text-placeholder">No reach or conversions recorded for this campaign.</p>
                        <ng-template #resultsTpl>
                            <dl class="m-0 grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                <div>
                                    <dt class="text-xs text-secondary">Reach</dt>
                                    <dd class="m-0 font-medium text-regular tabular-nums">{{ c.reach | number }}</dd>
                                </div>
                                <div>
                                    <dt class="text-xs text-secondary">Conversions</dt>
                                    <dd class="m-0 font-medium text-regular tabular-nums">{{ c.conversions | number }}</dd>
                                </div>
                                <div *ngIf="c.reach > 0">
                                    <dt class="text-xs text-secondary">Conversion rate</dt>
                                    <dd class="m-0 font-medium text-regular tabular-nums">{{ (c.conversions / c.reach) * 100 | number: '1.0-1' }}%</dd>
                                </div>
                            </dl>
                        </ng-template>
                    </section>

                    <section aria-labelledby="cd-brief" class="pt-5 border-t border-rowDivider">
                        <h3 id="cd-brief" class="m-0 mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">Brief</h3>
                        <p class="m-0 text-sm whitespace-pre-line break-words" [class.text-regular]="c.description" [class.text-placeholder]="!c.description">{{ c.description || 'No description' }}</p>
                        <p *ngIf="c.createdDate" class="m-0 mt-4 text-xs text-secondary">Created {{ c.createdDate | date: 'd MMM y' }}</p>
                    </section>
                </div>

                <footer *ngIf="canUpdate || canDelete" class="flex-none px-6 py-4 border-t border-rowDivider flex flex-wrap items-center justify-end gap-2">
                    <button *ngIf="canDelete" boo-button variant="ghost" size="sm" class="!text-danger mr-auto" [disabled]="busy" (click)="remove.emit(c)">
                        <physio-icon name="trash" [size]="15" aria-hidden="true" />Delete
                    </button>
                    <button *ngIf="canUpdate" boo-button variant="secondary" size="sm" aria-haspopup="dialog" [disabled]="busy" (click)="edit.emit(c)">
                        <physio-icon name="pencil" [size]="15" aria-hidden="true" />Edit campaign
                    </button>
                </footer>
            </div>
        </drawer>
    `,
})
export class CrmCampaignDetailDrawerComponent {
    @Input() campaign: Campaign | null = null;
    @Input() canUpdate = false;
    @Input() canDelete = false;
    /** A status change or delete of this campaign is in flight. */
    @Input() busy = false;
    /** The status being applied, to show progress on its button. */
    @Input() pendingStatus: number | null = null;
    /** Who the campaign's segment covers, when known. */
    @Input() segmentCriteria: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() edit = new EventEmitter<Campaign>();
    @Output() remove = new EventEmitter<Campaign>();
    @Output() transition = new EventEmitter<CampaignTransition>();

    readonly status = statusOf;
    readonly channel = channelOf;
    readonly timing = timingOf;
    readonly moves = transitionsOf;
    readonly use = budgetUse;
    readonly date = parseIsoDate;
    readonly min = Math.min;
    readonly abs = Math.abs;

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.campaign) this.close.emit();
    }

    /** Length of the campaign in days, counting both ends. */
    days(c: Campaign): number | null {
        const start = parseIsoDate(c.startDate);
        const end = parseIsoDate(c.endDate);
        if (!start || !end || end < start) return null;
        return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
    }
}
