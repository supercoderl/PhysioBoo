import { NgIf } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent } from '@physioboo/ui';
import { DrawerComponent } from '../../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../../components/textarea/boo-textarea/boo-textarea.component';
import { DialogService } from '../../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../../shared/directives/scrollbar.directive';

const REASON_MAX = 500;

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
    return control.value.trim() ? null : { required: true };
}

/** Collects the reason the API requires to cancel. The page closes the drawer only after the server accepts the cancel. */
@Component({
    selector: 'rx-cancel-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, CustomScrollbarDirective, BooButtonComponent, BooIconComponent, BooTextareaComponent],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="rx-cancel-title"
                [attr.inert]="isOpen ? null : ''"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <h2 id="rx-cancel-title" class="m-0 text-lg font-semibold leading-tight text-regular">Cancel prescription</h2>
                        <p class="m-0 mt-0.5 text-xs text-secondary truncate">{{ prescriptionNumber }}</p>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4" custom-scrollbar>
                    <p class="m-0 text-sm text-secondary">The prescription stays on record as cancelled and can no longer be dispensed. This cannot be undone.</p>
                    <div>
                        <label for="rx-cancel-reason" class="block mb-1 text-[13px] font-medium text-regular">Reason <span class="text-danger" aria-hidden="true">*</span></label>
                        <boo-textarea id="rx-cancel-reason" name="rx-cancel-reason" formControlName="reason" label="Reason" required [rows]="5" [maxlength]="max" />
                    </div>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Keep prescription</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="submitting">
                        <physio-icon *ngIf="!submitting" name="ban" [size]="15" aria-hidden="true" />Cancel prescription
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class PrescriptionCancelDrawerComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() prescriptionNumber = '';
    @Input() submitting = false;
    @Output() close = new EventEmitter<void>();
    @Output() confirmed = new EventEmitter<string>();

    private readonly fb = inject(FormBuilder);
    private readonly host: HTMLElement = inject(ElementRef).nativeElement;
    private readonly dialogSrv = inject(DialogService);

    readonly max = REASON_MAX;
    readonly form = this.fb.nonNullable.group({ reason: ['', [notBlank, Validators.maxLength(REASON_MAX)]] });

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['isOpen']?.currentValue) {
            // Wait for the drawer's slide-in before moving focus into it.
            setTimeout(() => this.host.querySelector<HTMLElement>('textarea')?.focus(), 350);
        }
    }

    submit(): void {
        if (this.submitting) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            setTimeout(() => this.host.querySelector<HTMLElement>('.ng-invalid textarea')?.focus());
            return;
        }
        this.confirmed.emit(this.form.getRawValue().reason.trim());
    }

    /** The page calls this once the cancel succeeded. */
    reset(): void {
        this.form.reset();
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.close.emit();
    }

    discard(): void {
        if (this.submitting) return;
        this.form.reset();
        this.close.emit();
    }
}
