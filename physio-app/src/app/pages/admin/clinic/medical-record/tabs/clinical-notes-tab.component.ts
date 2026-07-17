import { Component, Input, computed, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ClinicalNoteRow, RecordType } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-clinical-notes-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <!-- Note list -->
      <aside class="bg-surface border border-gray-200 rounded-lg overflow-hidden self-start">
        <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-primary m-0">Notes</h3>
          <span class="text-xs text-secondary">{{ data?.length || 0 }}</span>
        </div>
        <ul class="m-0 p-0 list-none max-h-[600px] overflow-y-auto" custom-scrollbar>
          <li *ngFor="let n of data" (click)="select(n)"
            class="px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50"
            [class.bg-primary]="selectedId() === n.id"
            [ngStyle]="selectedId() === n.id ? { 'background-color': 'rgb(var(--twc-primary) / 0.06)' } : {}">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-primary uppercase tracking-wider">{{ n.recordType }}</span>
              <span class="text-[10px] text-secondary">{{ n.recordDate | date:'MMM d, y' }}</span>
            </div>
            <div class="text-sm text-primary truncate">{{ n.chiefComplaint || n.finalDiagnosis || n.provisionalDiagnosis || '—' }}</div>
            <div class="text-xs text-secondary truncate">{{ n.doctorName }}</div>
          </li>
          <li *ngIf="!data?.length" class="px-4 py-8 text-center text-xs text-secondary">No clinical notes.</li>
        </ul>
      </aside>

      <!-- Selected note -->
      <article *ngIf="selected() as n" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <header class="px-6 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <span class="font-mono text-xs text-secondary bg-gray-100 px-2 py-0.5 rounded">{{ n.recordNumber }}</span>
            <span class="px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="typeClass(n.recordType)">{{ n.recordType }}</span>
            <span *ngIf="n.isConfidential" class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 inline-flex items-center gap-1">
              <boo-icon name="lock" iconClass="w-3 h-3"></boo-icon>
              Confidential · {{ n.accessLevel }}
            </span>
            <span *ngIf="n.appointmentNumber" class="text-xs text-secondary ml-auto">↔ {{ n.appointmentNumber }}</span>
          </div>
          <div class="text-sm text-primary"><strong>{{ n.doctorName }}</strong> · {{ n.recordDate | date:'longDate' }}</div>
        </header>

        <div class="p-6 space-y-5 text-sm leading-relaxed">
          <section *ngFor="let s of sectionsOf(n)" [hidden]="!s.body">
            <h4 class="text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">{{ s.label }}</h4>
            <p class="text-primary whitespace-pre-wrap m-0">{{ s.body }}</p>
          </section>

          <section *ngIf="n.icd10Codes?.length">
            <h4 class="text-[11px] font-bold text-secondary uppercase tracking-wider mb-1">ICD-10 codes</h4>
            <div class="flex flex-wrap gap-1.5">
              <span *ngFor="let c of n.icd10Codes" class="font-mono text-xs bg-gray-100 text-primary px-2 py-0.5 rounded">{{ c }}</span>
            </div>
          </section>
        </div>
      </article>

      <article *ngIf="!selected() && data?.length" class="bg-surface border border-dashed border-gray-300 rounded-lg p-12 text-center text-sm text-secondary">
        Select a note from the list to view full SOAP details.
      </article>
    </div>
    `,
})
export class ClinicalNotesTabComponent {
  @Input() set data(v: ClinicalNoteRow[] | null) {
    this._data.set(v ?? []);
    if ((v?.length ?? 0) > 0) this.selectedId.set(v![0].id);
  }
  get data() { return this._data(); }
  private _data = signal<ClinicalNoteRow[]>([]);

  selectedId = signal<string | null>(null);
  selected = computed(() => this._data().find(n => n.id === this.selectedId()) ?? null);

  select(n: ClinicalNoteRow) { this.selectedId.set(n.id); }

  sectionsOf(n: ClinicalNoteRow) {
    return [
      { label: 'Subjective — Chief complaint', body: n.chiefComplaint },
      { label: 'Subjective — History of present illness', body: n.historyOfPresentIllness },
      { label: 'Objective — Physical examination', body: n.physicalExamination },
      { label: 'Assessment — Provisional diagnosis', body: n.provisionalDiagnosis },
      { label: 'Assessment — Final diagnosis', body: n.finalDiagnosis },
      { label: 'Plan — Treatment plan', body: n.treatmentPlan },
      { label: 'Plan — Follow-up', body: n.followUpInstructions },
      { label: 'Doctor notes', body: n.doctorNotes },
      { label: 'Discharge summary', body: n.dischargeSummary },
    ];
  }

  typeClass(t: RecordType): string {
    switch (t) {
      case 'Consultation': return 'bg-blue-50 text-blue-700';
      case 'Diagnosis': return 'bg-violet-50 text-violet-700';
      case 'Treatment': return 'bg-emerald-50 text-emerald-700';
      case 'Surgery': return 'bg-orange-50 text-orange-700';
      case 'Discharge': return 'bg-gray-100 text-gray-600';
      case 'FollowUp': return 'bg-teal-50 text-teal-700';
      case 'Emergency': return 'bg-red-50 text-red-700';
    }
  }
}
