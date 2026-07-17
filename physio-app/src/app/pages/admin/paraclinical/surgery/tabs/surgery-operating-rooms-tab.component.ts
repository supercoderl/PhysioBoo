import { Component, EventEmitter, OnInit, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { SurgeryService } from "../../../../../services/admin/surgery.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { OperatingRoom, OperatingRoomStatus } from "../../../../../shared/types/surgery.types";

@Component({
  selector: 'surgery-operating-rooms-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !rooms().length"><boo-empty-state icon="hospital" title="No operating rooms configured"></boo-empty-state></div>

    <div *ngIf="!isLoading() && rooms().length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let r of rooms()" class="bg-surface border-2 rounded-lg p-4" [ngClass]="borderClass(r.status)">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ r.roomNumber }}</h3>
            <p class="text-xs text-gray-500">{{ r.roomType }}</p>
          </div>
          <boo-status-badge [label]="r.status" [tone]="statusTone(r.status)" [dotted]="true"></boo-status-badge>
        </div>

        <div *ngIf="r.currentSurgeryId" class="space-y-1 mb-3">
          <div class="text-sm font-medium text-gray-800">{{ r.currentProcedure }}</div>
          <div class="text-xs text-gray-500">{{ r.surgeonName }} · {{ r.patientName }}</div>
          <div class="text-xs text-gray-400" *ngIf="r.startTime">
            {{ r.startTime | date:'shortTime' }} – {{ r.estimatedFinishTime | date:'shortTime' }}
          </div>
        </div>
        <div *ngIf="!r.currentSurgeryId" class="text-xs text-gray-400 mb-3">No active surgery</div>

        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-xs font-medium" [ngClass]="r.equipmentReady ? 'text-emerald-600' : 'text-amber-600'">
            <boo-icon [name]="r.equipmentReady ? 'circle-check' : 'alert-triangle'" [size]="14"></boo-icon>
            {{ r.equipmentReady ? 'Equipment Ready' : 'Equipment Not Ready' }}
          </span>
          <button *ngIf="r.currentSurgeryId" (click)="viewCase.emit(r.currentSurgeryId!)" class="text-primary text-xs font-semibold hover:underline">View Case</button>
        </div>
      </div>
    </div>
  `,
})
export class SurgeryOperatingRoomsTabComponent implements OnInit {
  @Output() viewCase = new EventEmitter<string>();

  isLoading = signal(true);
  rooms = signal<OperatingRoom[]>([]);

  constructor(private srv: SurgeryService) { }

  ngOnInit(): void {
    this.srv.getRooms().subscribe({
      next: (res) => { if (res.success) this.rooms.set(res.data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  statusTone(status: OperatingRoomStatus): BadgeTone {
    switch (status) {
      case 'Available': case 'Ready': return 'success';
      case 'Preparing': case 'Cleaning': return 'primary';
      case 'InSurgery': return 'warning';
      case 'Maintenance': return 'danger';
      default: return 'neutral';
    }
  }

  borderClass(status: OperatingRoomStatus): string {
    switch (status) {
      case 'Available': case 'Ready': return 'border-emerald-200';
      case 'Preparing': case 'Cleaning': return 'border-indigo-200';
      case 'InSurgery': return 'border-amber-300';
      case 'Maintenance': return 'border-rose-300';
      default: return 'border-gray-200';
    }
  }
}
