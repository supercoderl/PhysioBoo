import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooInputComponent } from '@physioboo/ui';
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { RxDiagnosisEntry } from "../../../../../shared/types/prescription-rx.types";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";

@Component({
    selector: 'rx-diagnosis-section',
    standalone: true,
    imports: [SharedModule,BooInputComponent, BooTextareaComponent, BooButtonAdminComponent],
    template: `
    <div class="bg-surface border border-gray-200 rounded-lg">
      <button type="button" class="w-full px-5 py-3 flex items-center justify-between" (click)="expanded = !expanded">
        <h2 class="text-sm font-bold text-primary uppercase tracking-wider">Diagnosis</h2>
        <physio-icon [name]="expanded ? 'chevron-up' : 'chevron-down'" [size]="16" class="text-secondary"></physio-icon>
      </button>

      <div *ngIf="expanded" class="px-5 pb-5 space-y-4">
        <!-- Primary diagnosis -->
        <div>
          <label class="text-xs font-semibold text-secondary uppercase tracking-wider">Primary Diagnosis</label>
          <div class="mt-1.5" *ngIf="primaryDiagnosis">
            <span class="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-3 py-1.5 rounded-lg">
              {{ primaryDiagnosis.code }} — {{ primaryDiagnosis.description }}
              <button *ngIf="editable" type="button" (click)="removePrimary()" class="text-primary/60 hover:text-primary">
                <physio-icon name="x" [size]="14"></physio-icon>
              </button>
            </span>
          </div>
          <div *ngIf="!primaryDiagnosis && editable" class="grid grid-cols-3 gap-2 mt-1.5">
            <boo-input [(ngModel)]="newCode" placeholder="ICD-10 (e.g. I10)" class="col-span-1"></boo-input>
            <boo-input [(ngModel)]="newDescription" placeholder="Diagnosis description" class="col-span-2"></boo-input>
            <boo-button-admin (click)="addPrimary()" textColor="white" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" buttonClass="w-full" class="w-full col-span-3">
              Set Primary Diagnosis
            </boo-button-admin>
          </div>
        </div>

        <!-- Secondary diagnoses -->
        <div>
          <label class="text-xs font-semibold text-secondary uppercase tracking-wider">Secondary Diagnoses</label>
          <div class="flex flex-wrap gap-2 mt-1.5">
            <span *ngFor="let d of secondaryDiagnoses; let i = index" class="inline-flex items-center gap-2 bg-gray-100 text-secondary text-sm px-3 py-1.5 rounded-lg">
              {{ d.code }} — {{ d.description }}
              <button *ngIf="editable" type="button" (click)="removeSecondary(i)" class="text-secondary/70 hover:text-secondary">
                <physio-icon name="x" [size]="14"></physio-icon>
              </button>
            </span>
          </div>
          <div *ngIf="editable" class="grid grid-cols-3 gap-2 mt-2">
            <boo-input [(ngModel)]="newSecCode" placeholder="ICD-10" class="col-span-1"></boo-input>
            <boo-input [(ngModel)]="newSecDescription" placeholder="Diagnosis description" class="col-span-2"></boo-input>
            <boo-button-admin (click)="addSecondary()" background="transparent" textColor="rgb(var(--twc-secondary))" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 12px" [fontSize]="14" [radius]="8" fontWeight="500" buttonClass="w-full" class="w-full col-span-3">
              + Add Secondary Diagnosis
            </boo-button-admin>
          </div>
        </div>

        <!-- Clinical notes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <boo-textarea label="Symptoms" [rows]="3" [ngModel]="symptoms" (ngModelChange)="symptomsChange.emit($event)" [disabled]="!editable"></boo-textarea>
          <boo-textarea label="Clinical Notes" [rows]="3" [ngModel]="clinicalNotes" (ngModelChange)="clinicalNotesChange.emit($event)" [disabled]="!editable"></boo-textarea>
        </div>
      </div>
    </div>
  `,
})
export class PrescriptionDiagnosisSectionComponent {
    @Input() primaryDiagnosis: RxDiagnosisEntry | null = null;
    @Input() secondaryDiagnoses: RxDiagnosisEntry[] = [];
    @Input() symptoms = '';
    @Input() clinicalNotes = '';
    @Input() editable = true;

    @Output() primaryDiagnosisChange = new EventEmitter<RxDiagnosisEntry | null>();
    @Output() secondaryDiagnosesChange = new EventEmitter<RxDiagnosisEntry[]>();
    @Output() symptomsChange = new EventEmitter<string>();
    @Output() clinicalNotesChange = new EventEmitter<string>();

    expanded = true;
    newCode = '';
    newDescription = '';
    newSecCode = '';
    newSecDescription = '';

    addPrimary() {
        if (!this.newCode || !this.newDescription) return;
        this.primaryDiagnosisChange.emit({ code: this.newCode, description: this.newDescription });
        this.newCode = '';
        this.newDescription = '';
    }

    removePrimary() {
        this.primaryDiagnosisChange.emit(null);
    }

    addSecondary() {
        if (!this.newSecCode || !this.newSecDescription) return;
        this.secondaryDiagnosesChange.emit([...this.secondaryDiagnoses, { code: this.newSecCode, description: this.newSecDescription }]);
        this.newSecCode = '';
        this.newSecDescription = '';
    }

    removeSecondary(index: number) {
        const next = [...this.secondaryDiagnoses];
        next.splice(index, 1);
        this.secondaryDiagnosesChange.emit(next);
    }
}
