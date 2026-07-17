import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { SharedModule } from "../../../../shared/shared-imports";

export type NoteDialogMode = 'approve' | 'reject' | 'cancel';

@Component({
    selector: 'stock-take-note-dialog',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooTextareaComponent, BooButtonAdminComponent],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" (click)="onClose()"></div>

      <div class="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div class="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" [ngClass]="iconBg">
            <boo-icon [name]="iconName" [iconClass]="iconColor" [size]="20"></boo-icon>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">{{ subtitle }}</p>
          </div>
        </div>

        <div class="px-6 py-4">
          <boo-textarea [label]="noteLabel" [(ngModel)]="note" [required]="mode !== 'approve'"></boo-textarea>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
          <boo-button-admin textColor="white" [background]="mode === 'approve' ? 'rgb(var(--twc-primary))' : '#DC2626'" (click)="onConfirm()">{{ confirmLabel }}</boo-button-admin>
        </div>
      </div>
    </div>
  `,
})
export class StockTakeNoteDialogComponent implements OnChanges {
    @Input() isOpen = false;
    @Input() mode: NoteDialogMode = 'approve';
    @Output() close = new EventEmitter<void>();
    @Output() confirm = new EventEmitter<string>();

    note = '';

    ngOnChanges(): void {
        if (this.isOpen) this.note = '';
    }

    get title(): string {
        switch (this.mode) {
            case 'approve': return 'Approve Stock Take';
            case 'reject': return 'Reject Stock Take';
            case 'cancel': return 'Cancel Stock Take';
        }
    }

    get subtitle(): string {
        switch (this.mode) {
            case 'approve': return 'Confirm the reconciled counts and close this session.';
            case 'reject': return 'Send this session back to Counting for rework.';
            case 'cancel': return 'This session will be marked as Cancelled and cannot be resumed.';
        }
    }

    get noteLabel(): string {
        return this.mode === 'approve' ? 'Note (optional)' : 'Reason';
    }

    get confirmLabel(): string {
        switch (this.mode) {
            case 'approve': return 'Approve';
            case 'reject': return 'Reject';
            case 'cancel': return 'Confirm Cancel';
        }
    }

    get iconName(): string {
        switch (this.mode) {
            case 'approve': return 'circle-check-big';
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
        if (this.mode !== 'approve' && !this.note.trim()) return;
        this.confirm.emit(this.note.trim());
    }
}
