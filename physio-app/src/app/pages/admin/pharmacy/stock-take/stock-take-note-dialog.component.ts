import { BooButtonComponent, BooDialogComponent } from '@physioboo/ui';
import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";

export type NoteDialogMode = 'approve' | 'reject' | 'cancel';

@Component({
    selector: 'stock-take-note-dialog',
    standalone: true,
    imports: [SharedModule,BooTextareaComponent, BooButtonAdminComponent, BooButtonComponent, BooDialogComponent],
    template: `
    <boo-dialog *ngIf="isOpen" [heading]="title" [description]="subtitle" [tone]="mode === 'approve' ? 'success' : 'danger'" [icon]="iconName" [busy]="busy" (dismiss)="onClose()">
      <boo-textarea [label]="noteLabel" [(ngModel)]="note" [required]="mode !== 'approve'"></boo-textarea>
      <button boo-dialog-footer type="button" boo-button variant="secondary" size="sm" [disabled]="busy" (click)="onClose()">Back</button>
      <button boo-dialog-footer type="button" boo-button [variant]="mode === 'approve' ? 'primary' : 'danger'" size="sm" [loading]="busy" (click)="onConfirm()">{{ confirmLabel }}</button>
    </boo-dialog>
  `,
})
export class StockTakeNoteDialogComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() mode: NoteDialogMode = 'approve';
    @Input() busy = false;
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<string>();

    note = '';

    ngOnChanges(): void {
        if (this.isOpen) this.note = '';
    }

    get title(): string {
        switch (this.mode) {
            case 'approve': return 'Approve stock take';
            case 'reject': return 'Reject stock take';
            case 'cancel': return 'Cancel stock take';
        }
    }

    get subtitle(): string {
        switch (this.mode) {
            case 'approve': return 'Approving adjusts the system quantity of every batch whose count differs and records a stock movement for it. This cannot be undone.';
            case 'reject': return 'The session is closed as Rejected and stock is not adjusted. A rejected session cannot be reopened for counting.';
            case 'cancel': return 'The session is marked as Cancelled and cannot be resumed. Stock is not adjusted.';
        }
    }

    get noteLabel(): string {
        return this.mode === 'approve' ? 'Note (optional)' : 'Reason';
    }

    get confirmLabel(): string {
        switch (this.mode) {
            case 'approve': return 'Approve';
            case 'reject': return 'Reject';
            case 'cancel': return 'Cancel session';
        }
    }

    get iconName(): string {
        switch (this.mode) {
            case 'approve': return 'check-circle';
            case 'reject': return 'circle-x';
            case 'cancel': return 'ban';
        }
    }


    onClose(): void {
        this.close.emit();
    }

    onConfirm(): void {
        if (this.busy || (this.mode !== 'approve' && !this.note.trim())) return;
        this.confirm.emit(this.note.trim());
    }
}
