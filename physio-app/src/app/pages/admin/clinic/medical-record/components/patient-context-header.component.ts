import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Severity } from "../../../../../shared/enums/severity";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PatientContext, RiskFlag } from "../../../../../shared/types/medical-record.types";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";

@Component({
  selector: 'mr-patient-context-header',
  standalone: true,
  imports: [SharedModule, BooButtonAdminComponent],
  template: `
    <div *ngIf="patient" class="bg-surface border-b border-gray-200">
      <div class="px-6 py-4 flex items-start gap-5">
        <!-- Avatar -->
        <div class="shrink-0">
          <div *ngIf="!patient.avatarUrl" class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-xl">
            {{ initials() }}
          </div>
          <img *ngIf="patient.avatarUrl" [src]="patient.avatarUrl" class="w-16 h-16 rounded-full object-cover" />
        </div>

        <!-- Identity + facts -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-3 mb-1 flex-wrap">
            <h1 class="text-xl font-bold text-primary m-0 truncate">{{ patient.fullName }}</h1>
            <span class="font-mono text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded">{{ patient.mrn }}</span>
            <span
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
              [ngClass]="statusClass(patient.admissionStatus)">
              <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
              {{ patient.admissionStatus }}
              <span *ngIf="patient.roomNumber" class="opacity-70">· Room {{ patient.roomNumber }}</span>
            </span>
          </div>

          <div class="flex items-center gap-4 text-xs text-secondary flex-wrap">
            <span><span class="text-gray-400 mr-1">Sex</span>{{ patient.gender }}</span>
            <span><span class="text-gray-400 mr-1">DOB</span>{{ patient.dateOfBirth | date:'longDate' }} · {{ patient.ageYears }}y</span>
            <span *ngIf="patient.bloodType"><span class="text-gray-400 mr-1">Blood</span><span class="font-semibold text-red-600">{{ patient.bloodType }}</span></span>
            <span *ngIf="patient.phone"><span class="text-gray-400 mr-1">Phone</span>{{ patient.phone }}</span>
            <span *ngIf="patient.insuranceProvider">
              <span class="text-gray-400 mr-1">Insurance</span>
              {{ patient.insuranceProvider }} · {{ patient.insurancePolicyNumber }}
            </span>
            <span *ngIf="patient.primaryDoctor">
              <span class="text-gray-400 mr-1">PCP</span>{{ patient.primaryDoctor.fullName }}
            </span>
          </div>

          <!-- Risk flags -->
          <div *ngIf="patient.riskFlags?.length" class="flex items-center gap-1.5 mt-2 flex-wrap">
            <span
              *ngFor="let f of patient.riskFlags"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              [ngClass]="flagClass(f)"
              [title]="f.note || ''">
              <physio-icon [name]="flagIcon(f.key)" class="w-3 h-3"></physio-icon>
              {{ f.label }}
            </span>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="shrink-0 flex items-center gap-1.5 flex-wrap justify-end">
          <boo-button-admin (click)="action.emit('encounter')" textColor="white" [fontSize]="12" [radius]="4" fontWeight="500" [gap]="6">
            <physio-icon name="plus" class="w-3.5 h-3.5"></physio-icon>
            New Encounter
          </boo-button-admin>
          <boo-button-admin (click)="action.emit('note')" background="transparent" textColor="rgb(var(--twc-primary))" [border]="{ width: 1, color: '#EFE3E7' }" [fontSize]="12" [radius]="4" fontWeight="500" [gap]="6">
            <physio-icon name="file-text" class="w-3.5 h-3.5"></physio-icon>
            Add Note
          </boo-button-admin>
          <boo-button-admin (click)="action.emit('prescribe')" background="transparent" textColor="rgb(var(--twc-primary))" [border]="{ width: 1, color: '#EFE3E7' }" [fontSize]="12" [radius]="4" fontWeight="500" [gap]="6">
            <physio-icon name="pill" class="w-3.5 h-3.5"></physio-icon>
            Prescribe
          </boo-button-admin>
          <boo-button-admin (click)="action.emit('lab')" background="transparent" textColor="rgb(var(--twc-primary))" [border]="{ width: 1, color: '#EFE3E7' }" [fontSize]="12" [radius]="4" fontWeight="500" [gap]="6">
            <physio-icon name="flask-conical" class="w-3.5 h-3.5"></physio-icon>
            Order Lab
          </boo-button-admin>
          <boo-button-admin (click)="action.emit('imaging')" background="transparent" textColor="rgb(var(--twc-primary))" [border]="{ width: 1, color: '#EFE3E7' }" [fontSize]="12" [radius]="4" fontWeight="500" [gap]="6">
            <physio-icon name="scan" class="w-3.5 h-3.5"></physio-icon>
            Order Imaging
          </boo-button-admin>
          <boo-button-admin (click)="action.emit('print')" title="Print medical record" background="transparent" textColor="rgb(var(--twc-secondary))" [border]="{ width: 1, color: '#EFE3E7' }" padding="6px 8px" [fontSize]="12" [radius]="4">
            <physio-icon name="printer" class="w-3.5 h-3.5"></physio-icon>
          </boo-button-admin>
          <boo-button-admin (click)="action.emit('discharge')" title="Discharge patient" background="transparent" textColor="#DC2626" [border]="{ width: 1, color: '#FECACA' }" padding="6px 8px" [fontSize]="12" [radius]="4">
            <physio-icon name="logout" class="w-3.5 h-3.5"></physio-icon>
          </boo-button-admin>
        </div>
      </div>
    </div>
    `,
})
export class PatientContextHeaderComponent {
  @Input() patient: PatientContext | null = null;
  @Output() action = new EventEmitter<'encounter' | 'note' | 'prescribe' | 'lab' | 'imaging' | 'print' | 'discharge'>();

  initials(): string {
    const parts = (this.patient?.fullName ?? '?').trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase() || '?';
  }

  statusClass(s: string): string {
    switch (s) {
      case 'ICU': return 'bg-red-50 text-red-700';
      case 'Admitted': return 'bg-amber-50 text-amber-700';
      case 'ED': return 'bg-orange-50 text-orange-700';
      case 'Observation': return 'bg-primarySoft text-primaryHover';
      case 'Discharged': return 'bg-gray-100 text-gray-600';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  }

  flagClass(f: RiskFlag): string {
    switch (f.severity) {
      case Severity.Critical: return 'bg-red-50 text-red-700 border border-red-200';
      case Severity.Moderate: return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-primarySoft text-primaryHover border border-primary/25';
    }
  }

  flagIcon(k: RiskFlag['key']): string {
    switch (k) {
      case 'allergy': return 'triangle-alert';
      case 'critical': return 'heart-pulse';
      case 'chronic': return 'activity';
      case 'fall': return 'arrow-down';
      case 'infection': return 'biohazard';
      case 'isolation': return 'shield';
      default: return 'info';
    }
  }
}
