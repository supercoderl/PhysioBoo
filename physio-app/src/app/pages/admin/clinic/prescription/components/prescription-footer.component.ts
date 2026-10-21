import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BooButtonComponent, BooIconComponent } from '@physioboo/ui';

/** Sticky action bar. Which actions show follows the prescription's status and the user's permissions. */
@Component({
    selector: 'rx-footer',
    standalone: true,
    imports: [NgIf, BooButtonComponent, BooIconComponent],
    template: `
        <div class="sticky bottom-0 z-30">
            <div class="bg-surface border border-borderGray rounded-xl shadow-[0_-2px_8px_rgba(0,0,0,0.04)] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <p class="m-0 text-xs text-secondary mr-auto" aria-live="polite">
                    <ng-container *ngIf="issueBlockedReason && canIssue; else totalText">{{ issueBlockedReason }}</ng-container>
                    <ng-template #totalText>Lines total <span class="font-semibold text-regular tabular-nums">{{ total }}</span></ng-template>
                </p>
                <button *ngIf="canCancel" type="button" boo-button variant="outline" size="sm" [disabled]="busy" (click)="cancel.emit()">
                    <physio-icon name="ban" [size]="15" aria-hidden="true" />Cancel prescription
                </button>
                <button *ngIf="canEdit" type="button" boo-button variant="secondary" size="sm" [loading]="saving" [disabled]="busy || !dirty" (click)="save.emit()">
                    <physio-icon *ngIf="!saving" name="check-circle" [size]="15" aria-hidden="true" />Save changes
                </button>
                <button *ngIf="canIssue" type="button" boo-button variant="primary" size="sm" [loading]="issuing" [disabled]="busy || !!issueBlockedReason" (click)="issue.emit()">
                    <physio-icon *ngIf="!issuing" name="file-text" [size]="15" aria-hidden="true" />Issue prescription
                </button>
            </div>
        </div>
    `,
})
export class PrescriptionFooterComponent {
    @Input() total = '';
    @Input() canEdit = false;
    @Input() canIssue = false;
    @Input() canCancel = false;
    @Input() dirty = false;
    @Input() saving = false;
    @Input() issuing = false;
    /** Any request in flight; every action is disabled meanwhile so nothing is submitted twice. */
    @Input() busy = false;
    /** Why Issue is unavailable right now, or null. */
    @Input() issueBlockedReason: string | null = null;
    @Output() save = new EventEmitter<void>();
    @Output() issue = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();
}
