import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { Severity } from "../../../../../shared/enums/severity";
import { SharedModule } from "../../../../../shared/shared-imports";
import { PatientContext, RiskFlag } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-patient-context-header',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
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
              <boo-icon [name]="flagIcon(f.key)" iconClass="w-3 h-3"></boo-icon>
              {{ f.label }}
            </span>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="shrink-0 flex items-center gap-1.5 flex-wrap justify-end">
          <button (click)="action.emit('encounter')" class="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded hover:opacity-90 flex items-center gap-1.5">
            <boo-icon name="plus" iconClass="w-3.5 h-3.5"></boo-icon>
            New Encounter
          </button>
          <button (click)="action.emit('note')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 text-primary rounded hover:bg-gray-50 flex items-center gap-1.5">
            <boo-icon name="file-text" iconClass="w-3.5 h-3.5"></boo-icon>
            Add Note
          </button>
          <button (click)="action.emit('prescribe')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 text-primary rounded hover:bg-gray-50 flex items-center gap-1.5">
            <boo-icon name="pill" iconClass="w-3.5 h-3.5"></boo-icon>
            Prescribe
          </button>
          <button (click)="action.emit('lab')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 text-primary rounded hover:bg-gray-50 flex items-center gap-1.5">
            <boo-icon name="flask-conical" iconClass="w-3.5 h-3.5"></boo-icon>
            Order Lab
          </button>
          <button (click)="action.emit('imaging')" class="px-3 py-1.5 text-xs font-medium border border-gray-200 text-primary rounded hover:bg-gray-50 flex items-center gap-1.5">
            <boo-icon name="scan" iconClass="w-3.5 h-3.5"></boo-icon>
            Order Imaging
          </button>
          <button (click)="action.emit('print')" class="px-2 py-1.5 text-xs text-secondary border border-gray-200 rounded hover:bg-gray-50" title="Print medical record">
            <boo-icon name="printer" iconClass="w-3.5 h-3.5"></boo-icon>
          </button>
          <button (click)="action.emit('discharge')" class="px-2 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50" title="Discharge patient">
            <boo-icon name="log-out" iconClass="w-3.5 h-3.5"></boo-icon>
          </button>
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
      case 'Observation': return 'bg-blue-50 text-blue-700';
      case 'Discharged': return 'bg-gray-100 text-gray-600';
      default: return 'bg-emerald-50 text-emerald-700';
    }
  }

  flagClass(f: RiskFlag): string {
    switch (f.severity) {
      case Severity.Critical: return 'bg-red-50 text-red-700 border border-red-200';
      case Severity.Moderate: return 'bg-amber-50 text-amber-700 border border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
  }

  flagIcon(k: RiskFlag['key']): string {
    switch (k) {
      case 'allergy': return 'alert-triangle';
      case 'critical': return 'heart-pulse';
      case 'chronic': return 'activity';
      case 'fall': return 'arrow-down';
      case 'infection': return 'biohazard';
      case 'isolation': return 'shield';
      default: return 'info';
    }
  }
}
