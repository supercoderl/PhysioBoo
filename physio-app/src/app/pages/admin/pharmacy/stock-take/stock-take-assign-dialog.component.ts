import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup } from "../../../../shared/types/common";
import { AssignCounterPayload } from "../../../../shared/types/stock-take.types";

@Component({
    selector: 'stock-take-assign-dialog',
    standalone: true,
    imports: [SharedModule, BooSelectComponent, BooButtonAdminComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="stock-take-assign-title" (keydown.escape)="close.emit()">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="close.emit()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <physio-icon name="user-plus" [size]="20" class="text-primary"></physio-icon>
          </div>
          <div class="flex-1">
            <h3 id="stock-take-assign-title" class="text-lg font-semibold text-gray-900">Assign counter</h3>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">Choose who counts {{ code }}.</p>
          </div>
        </div>

        <div class="px-6 py-4 space-y-3">
          <boo-select label="Counter" [(ngModel)]="assignedTo" required
            [options]="users" bindLabel="name" bindValue="id"></boo-select>
          <p *ngIf="loaded && !users.length" class="m-0 text-xs text-secondary">No users could be listed. Counter candidates need permission to view users.</p>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <boo-button-admin background="transparent" (click)="close.emit()">Cancel</boo-button-admin>
          <boo-button-admin textColor="white" (click)="onConfirm()" [disabled]="!assignedTo || busy" [loading]="busy">Assign</boo-button-admin>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeAssignDialogComponent implements OnInit, OnChanges {
    @Input() isOpen = false;
    @Input() code = '';
    @Input() busy = false;
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<AssignCounterPayload>();

    users: Lookup[] = [];
    loaded = false;
    assignedTo: string | null = null;

    constructor(private srv: StockTakeService) { }

    ngOnInit(): void {
        this.srv.getUsers().subscribe({
            next: users => { this.users = users; this.loaded = true; },
            error: () => { this.loaded = true; },
        });
    }

    ngOnChanges(): void {
        if (this.isOpen) this.assignedTo = null;
    }

    onConfirm(): void {
        if (!this.assignedTo || this.busy) return;
        this.confirm.emit({ assignedTo: this.assignedTo });
    }
}
