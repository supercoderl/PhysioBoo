import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { TimelineCategory, TimelineRangeKey, TreatmentTimelineEntry } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-timeline-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooSelectComponent, EmptyStateComponent],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <h3 class="text-sm font-semibold text-primary m-0">Treatment Timeline</h3>
      <boo-select [(ngModel)]="range" (ngModelChange)="load()" [options]="rangeOptions" bindLabel="label" bindValue="value"></boo-select>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !entries().length"><boo-empty-state icon="history" title="No timeline entries" description="Nothing recorded for this range yet."></boo-empty-state></div>

    <ol *ngIf="!isLoading() && entries().length" class="relative border-l border-gray-200 ml-2 space-y-5">
      <li *ngFor="let e of entries()" class="ml-4">
        <span class="absolute -left-[5px] w-2.5 h-2.5 rounded-full bg-primary mt-1.5"></span>
        <div class="flex items-center gap-2 mb-0.5">
          <boo-icon [name]="categoryIcon(e.category)" [size]="14" iconClass="text-primary"></boo-icon>
          <span class="text-sm font-medium text-gray-800">{{ e.title }}</span>
        </div>
        <p class="text-xs text-secondary">{{ e.occurredAt | date:'medium' }} · {{ e.actorName }} <span *ngIf="e.status"> · {{ e.status }}</span></p>
        <p *ngIf="e.detail" class="text-xs text-gray-600 mt-0.5">{{ e.detail }}</p>
      </li>
    </ol>
  `,
})
export class TreatmentTimelineTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  entries = signal<TreatmentTimelineEntry[]>([]);
  range: TimelineRangeKey = 'Today';

  readonly rangeOptions: { label: string; value: TimelineRangeKey }[] = [
    { label: 'Today', value: 'Today' },
    { label: 'Last 24 Hours', value: 'Last24Hours' },
    { label: 'Last 7 Days', value: 'Last7Days' },
  ];

  constructor(private srv: TreatmentSheetService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.srv.getTimeline(this.patientId, { range: this.range }).subscribe({
      next: (res) => { if (res.success) this.entries.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  categoryIcon(category: TimelineCategory): string {
    switch (category) {
      case 'DoctorOrder': return 'stethoscope';
      case 'MedicationOrder': return 'pill';
      case 'Procedure': return 'activity';
      case 'LabOrder': return 'flask-conical';
      case 'ImagingOrder': return 'scan';
      case 'NursingActivity': return 'heart-pulse';
      case 'ProgressNote': return 'file-text';
      case 'CompletedTask': return 'circle-check';
      default: return 'circle';
    }
  }
}
