import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooErrorStateComponent, BooIconComponent, BooSpinnerComponent } from "@physioboo/ui";

/**
 * Frame of the form-style settings pages (Account, Security, Notifications, Theme, Billing): heading, the first
 * load's spinner or error, a body that scrolls inside the settings card, and, while `dirty`, a save bar pinned to
 * the bottom of the card so unsaved changes stay visible and can be saved or discarded from anywhere on the page.
 * Forms keep a readable width instead of stretching across the card.
 */
@Component({
    selector: 'setting-page',
    standalone: true,
    imports: [NgIf, BooButtonComponent, BooIconComponent, BooSpinnerComponent, BooErrorStateComponent],
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' },
    template: `
        <div class="flex-1 min-h-0 overflow-y-auto boo-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6" [attr.aria-busy]="loading">
            <div class="max-w-[880px] flex flex-col gap-5 pt-5 pb-8">
                <header class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">{{ heading }}</h1>
                        <p *ngIf="description" class="m-0 mt-0.5 text-xs leading-5 text-secondary">{{ description }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 empty:hidden"><ng-content select="[pageActions]"></ng-content></div>
                </header>

                <div *ngIf="loading" class="flex items-center justify-center gap-3 py-16 text-sm text-secondary" role="status">
                    <boo-spinner [size]="22" position="relative" mainColor="rgb(var(--twc-primary))" strokeColor="rgb(var(--twc-primary) / 0.2)" />
                    {{ loadingLabel }}
                </div>

                <div *ngIf="!loading && loadFailed" class="bg-surface border border-borderGray rounded-xl">
                    <boo-error-state [title]="failedTitle" description="Check your connection and try again." (retry)="retry.emit()" />
                </div>

                <ng-container *ngIf="!loading && !loadFailed"><ng-content></ng-content></ng-container>
            </div>
        </div>

        <div
            *ngIf="dirty && !loading && !loadFailed"
            class="shrink-0 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 border-t border-borderGray bg-surface flex flex-wrap items-center justify-between gap-3"
            role="region"
            aria-label="Unsaved changes"
        >
            <p class="m-0 flex items-center gap-2 text-sm text-regular">
                <physio-icon name="circle-alert" [size]="16" class="text-amber-600" aria-hidden="true" />
                {{ dirtyLabel }}
            </p>
            <div class="flex items-center gap-2">
                <button type="button" boo-button variant="secondary" size="sm" [disabled]="saving" (click)="discard.emit()">Discard</button>
                <button type="button" boo-button variant="primary" size="sm" [loading]="saving" (click)="save.emit()">{{ saving ? 'Saving…' : saveLabel }}</button>
            </div>
        </div>
    `
})
export class SettingPageComponent {
    /** Page heading. Not `title`, which would also put a tooltip on the whole page. */
    @Input({ required: true }) heading!: string;
    @Input() description = '';
    @Input() loading = false;
    @Input() loadingLabel = 'Loading…';
    @Input() loadFailed = false;
    @Input() failedTitle = 'We couldn’t load these settings';
    /** Shows the save bar. */
    @Input() dirty = false;
    @Input() dirtyLabel = 'You have unsaved changes.';
    @Input() saving = false;
    @Input() saveLabel = 'Save changes';
    @Output() save = new EventEmitter<void>();
    @Output() discard = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();
}
