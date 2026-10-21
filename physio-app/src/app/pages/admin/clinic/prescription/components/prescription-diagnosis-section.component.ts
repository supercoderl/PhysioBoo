import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BooTextareaComponent } from '../../../../../components/textarea/boo-textarea/boo-textarea.component';

export const RX_TEXT_MAX = 2000;

/** Diagnosis and instructions. The form belongs to the page so it can track unsaved changes. */
@Component({
    selector: 'rx-details-form',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, BooTextareaComponent],
    template: `
        <section class="bg-surface border border-borderGray rounded-xl px-5 py-4" aria-labelledby="rx-details-title">
            <h2 id="rx-details-title" class="m-0 mb-3 text-sm font-semibold text-regular">Details</h2>
            <form *ngIf="editable" [formGroup]="form" class="grid grid-cols-1 lg:grid-cols-2 gap-4" novalidate>
                <div>
                    <label for="rx-diagnosis" class="block mb-1 text-[13px] font-medium text-regular">Diagnosis</label>
                    <boo-textarea id="rx-diagnosis" name="rx-diagnosis" formControlName="diagnosis" label="Diagnosis" [rows]="4" [maxlength]="max" />
                </div>
                <div>
                    <label for="rx-instructions" class="block mb-1 text-[13px] font-medium text-regular">Instructions for the patient</label>
                    <boo-textarea id="rx-instructions" name="rx-instructions" formControlName="instructions" label="Instructions" [rows]="4" [maxlength]="max" />
                </div>
            </form>
            <dl *ngIf="!editable" class="m-0 grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                    <dt class="text-xs text-secondary">Diagnosis</dt>
                    <dd class="m-0 text-regular whitespace-pre-line">{{ form.controls['diagnosis'].value || 'None recorded' }}</dd>
                </div>
                <div>
                    <dt class="text-xs text-secondary">Instructions for the patient</dt>
                    <dd class="m-0 text-regular whitespace-pre-line">{{ form.controls['instructions'].value || 'None recorded' }}</dd>
                </div>
            </dl>
        </section>
    `,
})
export class PrescriptionDiagnosisSectionComponent {
    @Input({ required: true }) form!: FormGroup;
    @Input() editable = false;
    readonly max = RX_TEXT_MAX;
}
