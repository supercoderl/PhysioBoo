import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BooButtonComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../../components/drawer/drawer.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { LaboratoryDrawerShellComponent } from "./laboratory-drawer-shell.component";

/** The backend rejects an empty reason and one over 500 characters. */
const MAX_REASON_LENGTH = 500;

/**
 * Collects the required reason for recollecting or rejecting a specimen, and rejecting or returning a result.
 * The parent keeps the drawer open while `submitting` and after a failure, so the typed reason is never lost.
 */
@Component({
  selector: 'laboratory-reason-drawer',
  standalone: true,
  imports: [NgIf, FormsModule, DrawerComponent, BooButtonComponent, BooTextareaComponent, LaboratoryDrawerShellComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="requestClose()">
      <laboratory-drawer-shell *ngIf="isOpen" [title]="title" [subtitle]="subtitle" (close)="requestClose()">
        <form id="laboratory-reason-form" class="px-6 py-5 flex flex-col gap-4" (ngSubmit)="submit()" novalidate>
          <p *ngIf="description" class="m-0 text-sm text-regular">{{ description }}</p>

          <boo-textarea [label]="reasonLabel" name="reason" [required]="true" [rows]="4" [maxlength]="maxLength"
            [(ngModel)]="reason" [disabled]="submitting" />
          <div class="flex items-center justify-between gap-2 -mt-2">
            <span *ngIf="attempted && !reason.trim()" class="text-xs text-danger" role="alert">A reason is required.</span>
            <span class="text-xs text-secondary tabular-nums ml-auto">{{ reason.length }} / {{ maxLength }}</span>
          </div>

          <p *ngIf="failed" class="m-0 text-sm text-danger" role="alert">
            The request failed. Your reason is kept — try again.
          </p>
        </form>

        <ng-container footer>
          <button boo-button variant="secondary" size="sm" type="button" [disabled]="submitting" (click)="requestClose()">Cancel</button>
          <button boo-button variant="primary" size="sm" type="submit" form="laboratory-reason-form"
            [classname]="tone === 'danger' ? '!bg-danger !border-danger hover:!bg-danger/90' : ''"
            [loading]="submitting">{{ confirmLabel }}</button>
        </ng-container>
      </laboratory-drawer-shell>
    </drawer>
  `,
})
export class LaboratoryReasonDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle: string | null = null;
  @Input() description: string | null = null;
  @Input() reasonLabel = 'Reason';
  @Input() confirmLabel = 'Confirm';
  @Input() tone: 'danger' | 'primary' = 'primary';
  @Input() submitting = false;
  /** Set by the parent when the last request failed; cleared when the drawer reopens. */
  @Input() failed = false;
  @Output() confirm = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  readonly maxLength = MAX_REASON_LENGTH;
  reason = '';
  attempted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.reason = '';
      this.attempted = false;
    }
  }

  submit(): void {
    this.attempted = true;
    const reason = this.reason.trim();
    if (!reason || this.submitting) return;
    this.confirm.emit(reason);
  }

  requestClose(): void {
    if (!this.submitting) this.close.emit();
  }
}
