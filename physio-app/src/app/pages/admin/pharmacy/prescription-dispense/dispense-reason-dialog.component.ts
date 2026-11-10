import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BooButtonComponent, BooDialogComponent, BooFieldErrorComponent } from '@physioboo/ui';
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";

const REASON_MAX_LENGTH = 500;

/** Collects the mandatory reason the API requires for hold, cancel and substitution (1-500 characters). */
@Component({
  selector: 'dispense-reason-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooTextareaComponent, BooDialogComponent, BooFieldErrorComponent],
  template: `
    <boo-dialog *ngIf="isOpen" [heading]="title" [description]="description" [tone]="danger ? 'danger' : 'default'" [busy]="loading" (dismiss)="close.emit()">
      <boo-textarea [label]="label" [rows]="3" [maxlength]="maxLength" [required]="true" [(ngModel)]="reason"></boo-textarea>
      <boo-field-error size="sm" announce class="mt-1 mb-0" *ngIf="submitted && !reason.trim()">A reason is required.</boo-field-error>
      <button boo-dialog-footer type="button" boo-button variant="secondary" size="sm" [disabled]="loading" (click)="close.emit()">Keep working</button>
      <button boo-dialog-footer type="button" boo-button [variant]="danger ? 'danger' : 'primary'" size="sm" [loading]="loading" (click)="submit()">{{ confirmLabel }}</button>
    </boo-dialog>
  `,
})
export class DispenseReasonDialogComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() label = 'Reason';
  @Input() confirmLabel = 'Confirm';
  @Input() danger = false;
  @Input() loading = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();


  readonly maxLength = REASON_MAX_LENGTH;
  reason = '';
  submitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.reason = '';
      this.submitted = false;
    }
  }

  submit(): void {
    this.submitted = true;
    const reason = this.reason.trim();
    if (!reason || this.loading) return;
    this.confirm.emit(reason);
  }
}
