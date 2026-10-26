import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    BooButtonComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooIconComponent,
    BooInlineErrorComponent,
    BooInlineErrorState,
} from '@physioboo/ui';
import { LoadState } from './home-config.utils';

/**
 * Card for one home page list: heading, summary and add action, then the list itself (projected) or its loading,
 * access, error and empty states.
 */
@Component({
    selector: 'home-config-section',
    standalone: true,
    imports: [NgIf, NgFor, BooButtonComponent, BooIconComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent],
    template: `
        <section [id]="sectionId" tabindex="-1" class="scroll-mt-4 bg-surface border border-borderGray rounded-xl min-w-0 focus:outline-none" [attr.aria-labelledby]="sectionId + '-title'">
            <header class="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-rowDivider">
                <div class="min-w-0 flex-1 basis-64">
                    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h2 [id]="sectionId + '-title'" class="m-0 text-base leading-6 font-semibold text-regular">{{ heading }}</h2>
                        <span *ngIf="state === 'ready' && summary" class="text-xs text-secondary tabular-nums">{{ summary }}</span>
                    </div>
                    <p class="m-0 mt-0.5 text-xs leading-5 text-secondary">{{ description }}</p>
                </div>
                <button
                    *ngIf="canAdd && state === 'ready' && hasItems"
                    type="button"
                    boo-button
                    variant="secondary"
                    size="sm"
                    aria-haspopup="dialog"
                    (click)="add.emit()"
                ><physio-icon name="plus" [size]="15" aria-hidden="true" />{{ addLabel }}</button>
            </header>

            <div *ngIf="refreshFailed" class="px-5 pt-4">
                <boo-inline-error [what]="what" [state]="refreshState" [compact]="false" (retry)="retry.emit()" />
            </div>

            <div [attr.aria-busy]="state === 'loading'">
                <!-- First load -->
                <div *ngIf="state === 'loading'" aria-hidden="true">
                    <div *ngFor="let _ of skeleton" class="flex items-center gap-3 px-5 py-3.5 border-b border-rowDivider last:border-b-0">
                        <div class="w-5 h-3 rounded bg-rowDivider animate-pulse"></div>
                        <div class="w-16 h-10 rounded-md bg-rowDivider animate-pulse"></div>
                        <div class="flex-1 min-w-0">
                            <div class="h-3.5 w-56 max-w-full rounded bg-rowDivider animate-pulse"></div>
                            <div class="mt-2 h-3 w-80 max-w-full rounded bg-rowDivider animate-pulse"></div>
                        </div>
                        <div class="hidden sm:block w-16 h-5 rounded-full bg-rowDivider animate-pulse"></div>
                    </div>
                </div>
                <span *ngIf="state === 'loading'" class="sr-only" role="status">Loading {{ what }}…</span>

                <div *ngIf="state === 'forbidden'" class="px-5 py-8">
                    <boo-empty-state icon="lock" appearance="panel" [headingLevel]="3" [title]="'You can’t view ' + what" description="Ask an administrator for access to home page settings." />
                </div>

                <div *ngIf="state === 'failed'" class="px-5 py-8">
                    <boo-error-state icon="cloud-off" appearance="panel" [headingLevel]="3" [title]="'We couldn’t load ' + what" description="Check your connection and try again." retryLabel="Try again" (retry)="retry.emit()" />
                </div>

                <div *ngIf="state === 'ready' && !hasItems" class="px-5 py-8">
                    <boo-empty-state [icon]="emptyIcon" appearance="panel" [headingLevel]="3" [title]="emptyTitle" [description]="canAdd ? emptyDescription : emptyReadOnly">
                        <button *ngIf="canAdd" type="button" boo-button variant="primary" size="sm" aria-haspopup="dialog" (click)="add.emit()">
                            <physio-icon name="plus" [size]="15" aria-hidden="true" />{{ addLabel }}
                        </button>
                    </boo-empty-state>
                </div>

                <ng-container *ngIf="state === 'ready' && hasItems">
                    <ng-content></ng-content>
                </ng-container>
            </div>

            <footer *ngIf="state === 'ready' && note" class="px-5 py-3 border-t border-rowDivider">
                <p class="m-0 text-xs text-secondary">{{ note }}</p>
            </footer>
        </section>
    `,
})
export class HomeConfigSectionComponent {
    @Input({ required: true }) sectionId!: string;
    @Input({ required: true }) heading!: string;
    @Input() description = '';
    /** Plural noun used in loading and error messages, e.g. "hero banners". */
    @Input({ required: true }) what!: string;
    @Input() summary = '';
    @Input() state: LoadState = 'loading';
    @Input() hasItems = false;
    @Input() refreshFailed = false;
    @Input() refreshState: BooInlineErrorState = 'default';
    @Input() canAdd = false;
    @Input() addLabel = 'Add';
    @Input() emptyIcon = 'layout-list';
    @Input() emptyTitle = 'Nothing here yet';
    @Input() emptyDescription = '';
    @Input() emptyReadOnly = 'Items appear here once someone with edit access adds them.';
    /** Footnote under the list, e.g. how it is ordered. */
    @Input() note = '';
    @Output() add = new EventEmitter<void>();
    @Output() retry = new EventEmitter<void>();

    readonly skeleton = Array.from({ length: 3 });
}
