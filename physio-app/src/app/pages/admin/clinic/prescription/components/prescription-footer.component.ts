import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../../shared/shared-imports";

@Component({
    selector: 'rx-footer',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="sticky bottom-0 z-30 bg-surface border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] px-6 py-3 flex items-center justify-end gap-2">
      <span *ngIf="autosaveLabel" class="text-xs text-secondary mr-auto flex items-center gap-1.5">
        <boo-icon name="cloud" [size]="14"></boo-icon> {{ autosaveLabel }}
      </span>
      <ng-container *ngIf="editable">
        <button type="button" (click)="saveDraft.emit()" [disabled]="saving"
          class="px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg disabled:opacity-50">Save Draft</button>
        <button type="button" (click)="preview.emit()" class="px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg">Preview</button>
        <button type="button" (click)="print.emit()" class="px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg">Print</button>
        <button type="button" (click)="issue.emit()" [disabled]="!canIssue"
          [title]="!canIssue ? 'Add at least one medication before issuing' : ''"
          class="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
          Issue Prescription
        </button>
      </ng-container>
      <ng-container *ngIf="!editable">
        <button type="button" (click)="preview.emit()" class="px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg">Preview</button>
        <button type="button" (click)="print.emit()" class="px-4 py-2 text-sm font-medium text-secondary hover:bg-gray-100 rounded-lg">Print</button>
      </ng-container>
    </div>
  `,
})
export class PrescriptionFooterComponent {
    @Input() editable = true;
    @Input() saving = false;
    @Input() canIssue = false;
    @Input() autosaveLabel = '';

    @Output() saveDraft = new EventEmitter<void>();
    @Output() preview = new EventEmitter<void>();
    @Output() print = new EventEmitter<void>();
    @Output() issue = new EventEmitter<void>();
}
