import { CdkDragDrop, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ScheduleSlot } from "../../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-scheduling-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !rooms().length">
      <boo-empty-state icon="calendar-clock" title="No examination rooms with scheduled slots"></boo-empty-state>
    </div>

    <div *ngIf="!isLoading() && rooms().length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div *ngFor="let room of rooms()" class="bg-surface border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-4 py-3 bg-gray-100 text-xs font-semibold text-gray-600 uppercase flex items-center justify-between">
          <span>{{ room }}</span>
          <boo-icon name="door-open" [size]="14" iconClass="text-gray-400"></boo-icon>
        </div>
        <div
          cdkDropList
          [cdkDropListData]="slotsByRoom(room)"
          [id]="room"
          [cdkDropListConnectedTo]="rooms()"
          (cdkDropListDropped)="onDrop($event)"
          class="min-h-[120px] p-3 space-y-2"
        >
          <div *ngFor="let slot of slotsByRoom(room)" cdkDrag
            class="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-gray-800 truncate">{{ slot.patientName }}</span>
              <span class="text-xs text-gray-500">{{ slot.scheduledTime | date:'shortTime' }}</span>
            </div>
            <div class="text-xs text-gray-500">{{ slot.examinationName }} · {{ slot.modalityName }}</div>
            <div class="text-xs text-gray-400">{{ slot.technicianName ?? 'Unassigned technician' }} · {{ slot.estimatedDurationMinutes }} min</div>
            <div class="text-xs text-amber-600 mt-1" *ngIf="slot.preparationInstructions">{{ slot.preparationInstructions }}</div>
            <div class="flex gap-2 mt-2">
              <button (click)="reassign(slot)" class="text-primary text-[11px] font-semibold hover:underline">Reassign</button>
              <button (click)="cancelSlot(slot)" class="text-red-600 text-[11px] font-semibold hover:underline">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RadiologySchedulingTabComponent implements OnInit {
  isLoading = signal(true);
  slots = signal<ScheduleSlot[]>([]);

  constructor(private srv: RadiologyService, private toastSrv: ToastService, private dialogSrv: DialogService) { }

  ngOnInit(): void {
    this.srv.getScheduleSlots().subscribe({
      next: (res) => { if (res.success) this.slots.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  rooms(): string[] {
    return Array.from(new Set(this.slots().map(s => s.roomName)));
  }

  slotsByRoom(room: string): ScheduleSlot[] {
    return this.slots().filter(s => s.roomName === room);
  }

  onDrop(event: CdkDragDrop<ScheduleSlot[]>): void {
    if (event.previousContainer === event.container) return;
    const slot = event.previousContainer.data[event.previousIndex];
    const newRoom = event.container.id;
    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    this.slots.update(list => list.map(s => s.id === slot.id ? { ...s, roomName: newRoom } : s));
    this.srv.rescheduleSlot(slot.id, slot.scheduledTime, newRoom).subscribe(res => {
      if (res.success) this.toastSrv.success(`${slot.patientName} moved to ${newRoom}`);
      else this.toastSrv.error('Unable to reschedule slot');
    });
  }

  reassign(slot: ScheduleSlot): void {
    this.toastSrv.info(`Reassign technician for ${slot.orderNumber} — not wired yet`);
  }

  cancelSlot(slot: ScheduleSlot): void {
    this.dialogSrv.confirm(
      `Cancel the scheduled ${slot.examinationName} for ${slot.patientName}?`,
      () => {
        this.srv.cancelSlot(slot.id, 'Cancelled by scheduler').subscribe(res => {
          if (res.success) {
            this.slots.set(this.slots().filter(s => s.id !== slot.id));
            this.toastSrv.success('Slot cancelled');
          } else {
            this.toastSrv.error('Unable to cancel slot');
          }
        });
      },
      'Cancel Scheduled Exam',
      'danger',
      'Cancel Slot',
    );
  }
}
