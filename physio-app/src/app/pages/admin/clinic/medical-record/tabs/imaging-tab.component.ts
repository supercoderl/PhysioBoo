import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ImagingOrderStatus, ImagingStudyRow } from "../../../../../shared/types/medical-record.types";

@Component({
  selector: 'mr-imaging-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <div *ngIf="data?.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      <article *ngFor="let s of data" class="bg-surface border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <!-- Thumbnail / modality strip -->
        <div class="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
          <img *ngIf="s.imagesUrl" [src]="s.imagesUrl" class="absolute inset-0 w-full h-full object-cover opacity-90" />
          <boo-icon *ngIf="!s.imagesUrl" name="scan" iconClass="w-12 h-12 text-white/40"></boo-icon>
          <div class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-black/60 text-white">
            {{ s.modalityName }}
          </div>
          <div *ngIf="s.imagesCount > 0" class="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
            {{ s.imagesCount }} img
          </div>
          <div *ngIf="s.isCritical" class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wider uppercase inline-flex items-center gap-1">
            <boo-icon name="alert-triangle" iconClass="w-3 h-3"></boo-icon>
            Critical
          </div>
          <div *ngIf="s.isNormal && !s.isCritical" class="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wider uppercase">
            Normal
          </div>
        </div>

        <!-- Body -->
        <div class="p-4 flex-1 flex flex-col">
          <div class="flex items-baseline justify-between gap-2 mb-1">
            <h3 class="text-sm font-semibold text-primary m-0 truncate">{{ s.bodyPart || s.modalityName }}</h3>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" [ngClass]="statusClass(s.orderStatus)">
              {{ s.orderStatus }}
            </span>
          </div>

          <div class="text-xs text-secondary mb-2">
            <span *ngIf="s.studyDate">{{ s.studyDate | date:'mediumDate' }}</span>
            <span *ngIf="s.radiologistName"> · {{ s.radiologistName }}</span>
          </div>

          <p *ngIf="s.impression" class="text-sm text-primary line-clamp-3 mb-2 m-0">
            <strong class="font-semibold">Impression:</strong> {{ s.impression }}
          </p>

          <div class="mt-auto flex items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span class="font-mono text-secondary">{{ s.orderNumber }}</span>
            <div class="ml-auto flex items-center gap-1">
              <button *ngIf="s.reportPdfUrl" class="px-2 py-1 text-primary hover:bg-gray-100 rounded inline-flex items-center gap-1">
                <boo-icon name="file-text" iconClass="w-3 h-3"></boo-icon> Report
              </button>
              <button *ngIf="s.imagesUrl || s.dicomStudyUid" class="px-2 py-1 text-primary hover:bg-gray-100 rounded inline-flex items-center gap-1">
                <boo-icon name="image" iconClass="w-3 h-3"></boo-icon> Images
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div *ngIf="!data?.length" class="bg-surface border border-gray-200 rounded-lg py-16 text-center text-sm text-secondary">
      No imaging studies on file.
    </div>
    `,
})
export class ImagingTabComponent {
  @Input() data: ImagingStudyRow[] | null = null;

  statusClass(s: ImagingOrderStatus) {
    switch (s) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700';
      case 'InProgress': return 'bg-amber-50 text-amber-700';
      case 'Scheduled':
      case 'ReportPending': return 'bg-blue-50 text-blue-700';
      case 'Cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }
}
