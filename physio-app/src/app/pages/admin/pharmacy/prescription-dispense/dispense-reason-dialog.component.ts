import { Component, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { BooButtonComponent } from '@physioboo/ui';
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";

const REASON_MAX_LENGTH = 500;

/** Collects the mandatory reason the API requires for hold, cancel and substitution (1-500 characters). */
@Component({
  selector: 'dispense-reason-dialog',
  standalone: true,
  imports: [SharedModule, BooButtonComponent, BooTextareaComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" (click)="close.emit()" aria-hidden="true"></div>
      <div #panel tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="dispense-reason-title"
        class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 focus:outline-none">
        <div class="px-6 pt-5 pb-3">
          <h2 id="dispense-reason-title" class="text-lg font-semibold text-gray-900 m-0">{{ title }}</h2>
          <p class="text-sm text-gray-600 mt-1 mb-0 leading-relaxed">{{ description }}</p>
        </div>
        <div class="px-6 pb-4">
          <boo-textarea [label]="label" [rows]="3" [maxlength]="maxLength" [required]="true" [(ngModel)]="reason"></boo-textarea>
          <p *ngIf="submitted && !reason.trim()" class="mt-1 mb-0 text-xs text-danger" role="alert">A reason is required.</p>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button boo-button variant="secondary" (click)="close.emit()">Keep working</button>
          <button boo-button variant="primary" [classname]="danger ? '!bg-rose-600 hover:!bg-rose-700' : ''" [loading]="loading" (click)="submit()">{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
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

  @ViewChild('panel') private panel?: ElementRef<HTMLElement>;

  readonly maxLength = REASON_MAX_LENGTH;
  reason = '';
  submitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.reason = '';
      this.submitted = false;
      setTimeout(() => this.panel?.nativeElement.focus());
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen && !this.loading) this.close.emit();
  }

  submit(): void {
    this.submitted = true;
    const reason = this.reason.trim();
    if (!reason || this.loading) return;
    this.confirm.emit(reason);
  }
}
