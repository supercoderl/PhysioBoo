import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Reward } from '../../../../shared/types/reward.types';
import { REWARD_CATEGORY } from './member.utils';

/** Read-only list of the rewards members can redeem points for, cheapest first. */
@Component({
    selector: 'crm-rewards-catalog-drawer',
    standalone: true,
    imports: [NgIf, NgFor, DecimalPipe, DrawerComponent, BooButtonComponent, BooIconComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent, CustomScrollbarDirective],
    template: `
        <drawer [isOpen]="open" (close)="close.emit()">
            <div *ngIf="open" class="flex flex-col h-svh bg-surface" role="dialog" aria-modal="true" aria-labelledby="rewards-title">
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary">Loyalty programme</p>
                        <h2 id="rewards-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular">Rewards</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary">
                            What members can redeem points for<ng-container *ngIf="state === 'ready' && rewards.length && total <= rewards.length"> · {{ availableCount }} of {{ total }} available</ng-container>
                        </p>
                    </div>
                    <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close rewards" (click)="close.emit()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto flex flex-col" custom-scrollbar>
                    <ul *ngIf="state === 'ready' && rewards.length; else stateTpl" class="m-0 p-0 list-none divide-y divide-rowDivider">
                        <li *ngFor="let r of rewards" class="px-6 py-3.5 flex items-start justify-between gap-4" [class.opacity-60]="!r.available">
                            <div class="min-w-0">
                                <p class="m-0 text-sm font-semibold text-regular break-words">{{ r.title }}</p>
                                <p class="m-0 mt-0.5 text-xs text-secondary">{{ category(r) }}<span class="tabular-nums"> · {{ r.code }}</span></p>
                                <p *ngIf="r.description" class="m-0 mt-1 text-xs text-secondary break-words line-clamp-2" [title]="r.description">{{ r.description }}</p>
                            </div>
                            <div class="flex-none text-right">
                                <p class="m-0 text-sm font-semibold text-regular tabular-nums whitespace-nowrap">{{ r.pointsRequired | number }} <span class="text-xs font-medium text-secondary">pts</span></p>
                                <div *ngIf="!r.available" class="mt-1"><boo-status-badge label="Unavailable" tone="neutral" /></div>
                            </div>
                        </li>
                    </ul>
                    <p *ngIf="state === 'ready' && total > rewards.length" class="m-0 px-6 py-3 border-t border-rowDivider text-xs text-secondary">
                        Showing the {{ rewards.length }} cheapest of {{ total }} rewards.
                    </p>

                    <ng-template #stateTpl>
                        <div *ngIf="state === 'loading'" class="flex flex-col" aria-hidden="true">
                            <div *ngFor="let _ of skeletonRows" class="flex items-center justify-between gap-4 px-6 py-4 border-b border-rowDivider">
                                <div class="flex-1"><div class="h-3.5 w-48 max-w-full rounded bg-rowDivider animate-pulse"></div><div class="mt-2 h-3 w-24 rounded bg-rowDivider animate-pulse"></div></div>
                                <div class="w-14 h-3.5 rounded bg-rowDivider animate-pulse"></div>
                            </div>
                            <span class="sr-only" role="status">Loading rewards…</span>
                        </div>
                        <div *ngIf="state !== 'loading'" class="flex-1 flex items-center justify-center px-6 py-8">
                            <boo-empty-state *ngIf="state === 'forbidden'" icon="lock" title="You don't have access to rewards" description="Ask an administrator for permission to view the rewards catalog." />
                            <boo-error-state *ngIf="state === 'failed'" icon="cloud-off" title="We couldn't load rewards" description="Check your connection and try again." retryLabel="Try again" (retry)="retry.emit()" />
                            <boo-empty-state *ngIf="state === 'ready'" icon="gift" title="No rewards yet" description="Once rewards are added to the catalog, members can redeem points for them." />
                        </div>
                    </ng-template>
                </div>
            </div>
        </drawer>
    `,
})
export class CrmRewardsCatalogDrawerComponent {
    @Input() open = false;
    @Input() rewards: Reward[] = [];
    /** How many rewards the server holds, which may be more than were loaded. */
    @Input() total = 0;
    @Input() state: 'loading' | 'ready' | 'failed' | 'forbidden' = 'loading';
    @Output() close = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();

    readonly skeletonRows = Array.from({ length: 6 });

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.open) this.close.emit();
    }

    get availableCount(): number {
        return this.rewards.filter(r => r.available).length;
    }

    category(r: Reward): string {
        return REWARD_CATEGORY[r.category] ?? r.category;
    }
}
