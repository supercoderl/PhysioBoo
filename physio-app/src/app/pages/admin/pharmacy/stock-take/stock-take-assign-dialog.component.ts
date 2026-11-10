import { BooButtonComponent, BooDialogComponent } from '@physioboo/ui';
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
    imports: [SharedModule, BooSelectComponent, BooButtonAdminComponent, BooButtonComponent, BooDialogComponent],
    template: `
    <boo-dialog *ngIf="isOpen" heading="Assign counter" [description]="'Choose who counts ' + code + '.'" icon="user-plus" [busy]="busy" (dismiss)="close.emit()">
      <div class="space-y-3">
        <boo-select label="Counter" [(ngModel)]="assignedTo" required
          [options]="users" bindLabel="name" bindValue="id"></boo-select>
        <p *ngIf="loaded && !users.length" class="m-0 text-xs text-secondary">No users could be listed. Counter candidates need permission to view users.</p>
      </div>
      <button boo-dialog-footer type="button" boo-button variant="secondary" size="sm" [disabled]="busy" (click)="close.emit()">Cancel</button>
      <button boo-dialog-footer type="button" boo-button variant="primary" size="sm" [disabled]="!assignedTo" [loading]="busy" (click)="onConfirm()">Assign</button>
    </boo-dialog>
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
