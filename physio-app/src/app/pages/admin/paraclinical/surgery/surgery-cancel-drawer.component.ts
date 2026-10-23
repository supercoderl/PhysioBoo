import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BooButtonComponent } from '@physioboo/ui';
import { finalize } from "rxjs";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SurgeryService } from "../../../../services/admin/surgery.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { SurgeryRow } from "../../../../shared/types/surgery.types";

/** Cancelling a case requires a reason (the server rejects an empty one). */
@Component({
  selector: 'surgery-cancel-drawer',
  standalone: true,
  imports: [SharedModule, DrawerComponent, BooTextareaComponent, BooButtonComponent],
  template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">Cancel Surgery</h2>
            <p class="text-sm text-secondary m-0" *ngIf="surgery">{{ surgery.surgeryNumber }} — {{ surgery.procedure }} for {{ surgery.patientName }}</p>
          </div>
          <button boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="onClose()">
            <physio-icon name="x" [size]="20"></physio-icon>
          </button>
        </div>

        <form [formGroup]="form" class="flex-1 overflow-y-auto p-6 space-y-4" id="surgery-cancel-form" (ngSubmit)="submit()" novalidate>
          <p class="m-0 text-sm text-gray-600">Cancelling releases the operating room slot and cannot be undone.</p>
          <boo-textarea label="Cancellation reason" formControlName="reason" required [maxlength]="500"></boo-textarea>
          <p *ngIf="submitFailed()" class="m-0 text-sm text-danger" role="alert">
            The surgery was not cancelled. Your reason is kept — review the message shown and try again.
          </p>
        </form>

        <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end z-20 sticky bottom-0">
          <div class="flex gap-3">
            <button type="button" boo-button variant="ghost" size="sm" (click)="onClose()" [disabled]="submitting()">Keep surgery</button>
            <button type="submit" form="surgery-cancel-form" boo-button variant="primary" size="sm" [disabled]="submitting()" [loading]="submitting()">
              Cancel surgery
            </button>
          </div>
        </div>
      </div>
    </drawer>
  `,
})
export class SurgeryCancelDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() surgery: SurgeryRow | null = null;
  @Output() close = new EventEmitter<void>();
  /** The server confirmed the cancellation. */
  @Output() cancelled = new EventEmitter<string>();

  form: FormGroup;
  submitting = signal(false);
  submitFailed = signal(false);

  constructor(private fb: FormBuilder, private srv: SurgeryService, private toastSrv: ToastService) {
    this.form = this.fb.group({ reason: ['', [Validators.required, Validators.maxLength(500)]] });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['isOpen'] || !this.isOpen) return;
    this.form.reset({ reason: '' });
    this.submitFailed.set(false);
  }

  submit(): void {
    if (this.submitting() || !this.surgery) return;
    const reason = String(this.form.getRawValue().reason ?? '').trim();
    if (!reason) {
      this.form.get('reason')?.setValue('');
      this.form.markAllAsTouched();
      this.toastSrv.error('Enter a cancellation reason');
      return;
    }

    this.submitting.set(true);
    this.submitFailed.set(false);
    const id = this.surgery.id;
    this.srv.cancelCase(id, reason)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: res => {
          if (!res.success) { this.submitFailed.set(true); return; }
          this.toastSrv.success('Surgery cancelled');
          this.cancelled.emit(id);
        },
        error: () => this.submitFailed.set(true),
      });
  }

  onClose(): void {
    if (this.submitting()) return;
    this.close.emit();
  }
}
