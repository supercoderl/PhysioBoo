import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";

export type NoteDialogMode = 'approve' | 'reject' | 'cancel';

@Component({
    selector: 'stock-take-note-dialog',
    standalone: true,
    imports: [SharedModule,BooTextareaComponent, BooButtonAdminComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="stock-take-note-title" (keydown.escape)="onClose()">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="onClose()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [ngClass]="iconBg">
            <physio-icon [name]="iconName" [size]="20" [class]="iconColor"></physio-icon>
          </div>
          <div class="flex-1">
            <h3 id="stock-take-note-title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ subtitle }}</p>
          </div>
        </div>

        <div class="px-6 py-4">
          <boo-textarea [label]="noteLabel" [(ngModel)]="note" [required]="mode !== 'approve'"></boo-textarea>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <boo-button-admin background="transparent" (click)="onClose()">Back</boo-button-admin>
          <boo-button-admin textColor="white" [background]="mode === 'approve' ? 'rgb(var(--twc-primary))' : '#DC2626'" [disabled]="busy" [loading]="busy" (click)="onConfirm()">{{ confirmLabel }}</boo-button-admin>
        </div>
      </div>
    </div>
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

    get iconBg(): string { return this.mode === 'approve' ? 'bg-emerald-50' : 'bg-rose-50'; }
    get iconColor(): string { return this.mode === 'approve' ? 'text-emerald-600' : 'text-rose-600'; }

    onClose(): void {
        this.close.emit();
    }

    onConfirm(): void {
        if (this.busy || (this.mode !== 'approve' && !this.note.trim())) return;
        this.confirm.emit(this.note.trim());
    }
}
