import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup } from "../../../../shared/types/common";
import { AssignCounterPayload } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-assign-dialog',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooSelectComponent, BooDatepickerComponent, BooButtonAdminComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <boo-icon name="user-plus" iconClass="text-primary" [size]="20"></boo-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">Assign Counter</h3>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">Hand this stock take off to a counter with an optional due date.</p>
          </div>
        </div>

        <div class="px-6 py-4 space-y-3">
          <boo-select label="Counter" [(ngModel)]="assignedTo" required
            [options]="users" bindLabel="name" bindValue="id"></boo-select>
          <boo-datepicker label="Due Date" [(ngModel)]="dueDate"></boo-datepicker>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <boo-button-admin background="transparent" (click)="close.emit()">Cancel</boo-button-admin>
          <boo-button-admin textColor="white" (click)="onConfirm()" [disabled]="!assignedTo">Assign</boo-button-admin>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeAssignDialogComponent implements OnInit, OnChanges {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<AssignCounterPayload>();

    users: Lookup[] = [];
    assignedTo: string | null = null;
    dueDate: string | null = null;

    constructor(private srv: StockTakeService) { }

    ngOnInit(): void {
        this.srv.getUsers().subscribe(res => { if (res.success) this.users = res.data; });
    }

    ngOnChanges(): void {
        if (this.isOpen) { this.assignedTo = null; this.dueDate = null; }
    }

    onConfirm(): void {
        if (!this.assignedTo) return;
        this.confirm.emit({ assignedTo: this.assignedTo, dueDate: this.dueDate });
    }
}
