import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import {
    ClinicalWarningSeverity,
    FavoriteMedication,
    PrescriptionTemplate,
    RecentPrescriptionSummary,
    RxDiagnosisEntry,
    RxMedicationItem,
} from "../../../../../shared/types/prescription-rx.types";
import { severityIcon, severityRank } from "../prescription-rx.util";

interface AlertEntry {
    itemId: string;
    medicationName: string;
    severity: ClinicalWarningSeverity;
    message: string;
}

@Component({
    selector: 'rx-sidebar',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooTextareaComponent, StatusBadgeComponent],
    template: `
    <div class="space-y-4 sticky top-[72px]">
      <!-- Diagnosis recap -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4" *ngIf="primaryDiagnosis">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Diagnosis</h3>
        <div class="text-sm font-medium text-primary">{{ primaryDiagnosis.code }} — {{ primaryDiagnosis.description }}</div>
        <div *ngFor="let d of secondaryDiagnoses" class="text-xs text-secondary mt-1">{{ d.code }} — {{ d.description }}</div>
      </div>

      <!-- Medication count -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <span class="text-xs font-bold text-secondary uppercase tracking-wider">Medications</span>
        <span class="text-lg font-bold text-primary">{{ items.length }}</span>
      </div>

      <!-- Clinical alerts -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Clinical Alerts</h3>
        <div *ngIf="!alerts().length" class="text-xs text-secondary">No active clinical warnings.</div>
        <button *ngFor="let a of alerts()" type="button" (click)="scrollToRow.emit(a.itemId)"
          class="w-full text-left flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded px-1 -mx-1">
          <boo-icon [name]="severityIcon(a.severity)" [size]="14" [color]="alertColor(a.severity)" class="mt-0.5 shrink-0"></boo-icon>
          <div class="text-xs">
            <span class="font-medium text-primary">{{ a.medicationName }}</span>
            <span class="text-secondary"> — {{ a.message }}</span>
          </div>
        </button>
      </div>

      <!-- Recent prescriptions -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Recent Prescriptions</h3>
        <div *ngIf="!recent.length" class="text-xs text-secondary">No previous prescriptions.</div>
        <div *ngFor="let r of recent" class="py-1.5 border-b border-gray-50 last:border-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono text-secondary">{{ r.prescriptionNumber }}</span>
            <boo-status-badge [label]="r.status" [tone]="r.status === 'Issued' ? 'success' : 'neutral'"></boo-status-badge>
          </div>
          <div class="text-xs text-primary mt-0.5">{{ r.medicationNames.join(', ') }}</div>
        </div>
      </div>

      <!-- Favorites -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4" *ngIf="editable">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Favorite Medications</h3>
        <div *ngIf="!favorites.length" class="text-xs text-secondary">Star a medication line to add it here.</div>
        <div *ngFor="let f of favorites" class="flex items-center gap-1 py-1.5 border-b border-gray-50 last:border-0">
          <button type="button" (click)="applyFavorite.emit(f)"
            class="flex-1 text-left flex items-center justify-between hover:bg-gray-50 rounded px-1 -mx-1">
            <span class="text-xs text-primary">{{ f.name }} <span class="text-secondary">{{ f.strength }}</span></span>
            <boo-icon name="plus-circle" [size]="14" class="text-primary"></boo-icon>
          </button>
          <button type="button" (click)="removeFavorite.emit(f)" class="text-secondary hover:text-rose-600 p-0.5" title="Remove from favorites" aria-label="Remove from favorites">
            <boo-icon name="x" [size]="12"></boo-icon>
          </button>
        </div>
      </div>

      <!-- Templates -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4" *ngIf="editable">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Prescription Templates</h3>
        <div *ngIf="!templates.length" class="text-xs text-secondary">No templates yet.</div>
        <div *ngFor="let t of templates" class="flex items-center gap-1 py-1.5 border-b border-gray-50 last:border-0">
          <button type="button" (click)="applyTemplate.emit(t)"
            class="flex-1 text-left flex items-center justify-between hover:bg-gray-50 rounded px-1 -mx-1">
            <span class="text-xs">
              <span class="font-medium text-primary">{{ t.name }}</span>
              <span class="text-secondary"> · {{ t.itemCount }} items</span>
            </span>
            <boo-icon name="layers" [size]="14" class="text-primary"></boo-icon>
          </button>
          <button type="button" (click)="deleteTemplate.emit(t)" class="text-secondary hover:text-rose-600 p-0.5" title="Delete template" aria-label="Delete template">
            <boo-icon name="x" [size]="12"></boo-icon>
          </button>
        </div>

        <div *ngIf="items.length" class="mt-3 pt-3 border-t border-gray-100">
          <button *ngIf="!savingTemplate" type="button" (click)="savingTemplate = true" class="text-xs font-semibold text-primary hover:underline">
            + Save current medications as template
          </button>
          <div *ngIf="savingTemplate" class="flex items-center gap-1.5">
            <input type="text" [(ngModel)]="templateName" placeholder="Template name" maxlength="120" (keydown.enter)="submitTemplate()"
              class="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary" />
            <button type="button" (click)="submitTemplate()" [disabled]="!templateName.trim()" class="text-xs font-semibold text-white bg-primary px-2 py-1 rounded disabled:opacity-50">Save</button>
            <button type="button" (click)="savingTemplate = false; templateName = ''" class="text-xs text-secondary px-1">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Doctor notes -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4">
        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Doctor Notes</h3>
        <boo-textarea [rows]="3" [ngModel]="doctorNotes" (ngModelChange)="doctorNotesChange.emit($event)" [disabled]="!editable" placeholder="Scratch notes for this prescription..."></boo-textarea>
      </div>
    </div>
  `,
})
export class PrescriptionSidebarComponent {
    @Input() items: RxMedicationItem[] = [];
    @Input() primaryDiagnosis: RxDiagnosisEntry | null = null;
    @Input() secondaryDiagnoses: RxDiagnosisEntry[] = [];
    @Input() recent: RecentPrescriptionSummary[] = [];
    @Input() favorites: FavoriteMedication[] = [];
    @Input() templates: PrescriptionTemplate[] = [];
    @Input() doctorNotes = '';
    @Input() editable = true;

    @Output() scrollToRow = new EventEmitter<string>();
    @Output() applyFavorite = new EventEmitter<FavoriteMedication>();
    @Output() applyTemplate = new EventEmitter<PrescriptionTemplate>();
    @Output() removeFavorite = new EventEmitter<FavoriteMedication>();
    @Output() deleteTemplate = new EventEmitter<PrescriptionTemplate>();
    @Output() saveTemplate = new EventEmitter<string>();

    savingTemplate = false;
    templateName = '';

    submitTemplate(): void {
        const name = this.templateName.trim();
        if (!name) return;
        this.saveTemplate.emit(name);
        this.savingTemplate = false;
        this.templateName = '';
    }
    @Output() doctorNotesChange = new EventEmitter<string>();

    readonly severityIcon = severityIcon;

    alerts(): AlertEntry[] {
        const out: AlertEntry[] = [];
        for (const item of this.items) {
            for (const w of item.warnings) {
                if (!w.acknowledged) out.push({ itemId: item.id, medicationName: item.name, severity: w.severity, message: w.message });
            }
        }
        return out.sort((a, b) => severityRank(b.severity as any) - severityRank(a.severity as any));
    }

    alertColor(sev: string): string {
        switch (sev) {
            case 'Critical': return '#dc2626';
            case 'High': return '#ea580c';
            case 'Medium': return '#d97706';
            default: return '#2563eb';
        }
    }
}
