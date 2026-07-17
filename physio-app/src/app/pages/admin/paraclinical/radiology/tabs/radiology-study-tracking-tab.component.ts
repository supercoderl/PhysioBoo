import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { StudyRecord, StudyTimelineStage } from "../../../../../shared/types/radiology.types";

const STAGE_LABELS: Record<StudyTimelineStage, string> = {
  Ordered: 'Ordered',
  Scheduled: 'Scheduled',
  Arrived: 'Patient Arrived',
  ImagingStarted: 'Imaging Started',
  ImagingCompleted: 'Imaging Completed',
  ImageUploaded: 'Image Uploaded',
  Reporting: 'Reporting',
  Verified: 'Verified',
  Released: 'Released',
};

@Component({
  selector: 'radiology-study-tracking-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !studies().length">
      <boo-empty-state icon="scan" title="No studies to track"></boo-empty-state>
    </div>

    <div *ngIf="!isLoading() && studies().length" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Study list -->
      <div class="bg-surface border border-gray-200 rounded-lg overflow-hidden lg:col-span-1">
        <div class="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">Studies</div>
        <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <button *ngFor="let s of studies()" type="button" (click)="selected.set(s)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
            [ngClass]="selected()?.id === s.id ? 'bg-primary/5' : ''">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-gray-800 truncate">{{ s.patientName }}</span>
              <boo-icon *ngIf="s.isCritical" name="alert-triangle" [size]="14" iconClass="text-red-500"></boo-icon>
            </div>
            <div class="text-xs text-gray-500">{{ s.examinationName }} · {{ s.modalityName }}</div>
            <div class="text-xs text-gray-400">{{ s.orderNumber }}</div>
          </button>
        </div>
      </div>

      <!-- Detail panel -->
      <div class="bg-surface border border-gray-200 rounded-lg p-4 lg:col-span-2" *ngIf="selected()">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-semibold text-gray-800">{{ selected()!.patientName }} — {{ selected()!.examinationName }}</h3>
            <p class="text-xs text-gray-500">MRN {{ selected()!.mrn }} · {{ selected()!.modalityName }} · {{ selected()!.bodyPart }}</p>
          </div>
          <boo-status-badge *ngIf="selected()!.isCritical" label="Critical" tone="danger"></boo-status-badge>
        </div>

        <!-- Timeline -->
        <div class="mb-5">
          <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">Study Timeline</h4>
          <ol class="space-y-2">
            <li *ngFor="let ev of selected()!.timeline" class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="ev.occurredAt ? 'bg-emerald-500' : 'bg-gray-300'"></span>
              <span class="text-sm flex-1" [ngClass]="ev.occurredAt ? 'text-gray-800' : 'text-gray-400'">{{ stageLabel(ev.stage) }}</span>
              <span class="text-xs text-gray-400">{{ ev.occurredAt ? (ev.occurredAt | date:'short') : 'Pending' }}</span>
            </li>
          </ol>
        </div>

        <!-- Study info -->
        <div class="grid grid-cols-2 gap-3 mb-5 text-sm">
          <div><span class="text-gray-500">Technique</span><div class="font-medium text-gray-800">{{ selected()!.technique ?? '—' }}</div></div>
          <div><span class="text-gray-500">Images</span><div class="font-medium text-gray-800">{{ selected()!.imagesCount }}</div></div>
          <div><span class="text-gray-500">Study Date</span><div class="font-medium text-gray-800">{{ selected()!.studyDate ? (selected()!.studyDate | date:'medium') : '—' }}</div></div>
          <div><span class="text-gray-500">DICOM UID</span><div class="font-medium text-gray-800 truncate">{{ selected()!.dicomStudyUid ?? '—' }}</div></div>
        </div>

        <!-- Thumbnail placeholder grid -->
        <div class="mb-5">
          <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">Image Preview</h4>
          <div class="grid grid-cols-4 gap-2">
            <div *ngFor="let i of thumbnailPlaceholders" class="aspect-square bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
              <boo-icon name="image" [size]="20" iconClass="text-gray-300"></boo-icon>
            </div>
          </div>
        </div>

        <!-- PACS placeholder -->
        <div class="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-gray-50">
          <boo-icon name="monitor" [size]="28" iconClass="text-gray-400 mb-2"></boo-icon>
          <p class="text-sm font-medium text-gray-600">PACS Viewer — integration pending</p>
          <p class="text-xs text-gray-400 mt-1">No DICOM viewer is implemented in this module. This panel marks where a PACS viewer will be embedded.</p>
        </div>
      </div>
    </div>
  `,
})
export class RadiologyStudyTrackingTabComponent implements OnInit {
  isLoading = signal(true);
  studies = signal<StudyRecord[]>([]);
  selected = signal<StudyRecord | null>(null);

  readonly thumbnailPlaceholders = Array.from({ length: 8 });

  constructor(private srv: RadiologyService) { }

  ngOnInit(): void {
    this.srv.getStudies().subscribe({
      next: (res) => {
        if (res.success) {
          this.studies.set(res.data.items);
          this.selected.set(res.data.items[0] ?? null);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  stageLabel(stage: StudyTimelineStage): string {
    return STAGE_LABELS[stage];
  }
}
