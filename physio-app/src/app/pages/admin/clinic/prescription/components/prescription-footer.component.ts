import { Component, EventEmitter, Input, Output } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";

@Component({
    selector: 'rx-footer',
    standalone: true,
    imports: [SharedModule, BooButtonAdminComponent],
    template: `
    <div class="sticky bottom-0 z-30 bg-surface border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] px-6 py-3 flex items-center justify-end gap-2">
      <span *ngIf="autosaveLabel" class="text-xs text-secondary mr-auto flex items-center gap-1.5">
        <physio-icon name="cloud" [size]="14"></physio-icon> {{ autosaveLabel }}
      </span>
      <ng-container *ngIf="editable">
        <boo-button-admin (click)="saveDraft.emit()" [disabled]="saving" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500">Save Draft</boo-button-admin>
        <boo-button-admin (click)="preview.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500">Preview</boo-button-admin>
        <boo-button-admin (click)="print.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500">Print</boo-button-admin>
        <boo-button-admin (click)="issue.emit()" [disabled]="!canIssue" [title]="!canIssue ? 'Add at least one medication before issuing' : ''" textColor="white" padding="8px 20px" [fontSize]="14" [radius]="8" fontWeight="600">
          Issue Prescription
        </boo-button-admin>
      </ng-container>
      <ng-container *ngIf="!editable">
        <boo-button-admin (click)="preview.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500">Preview</boo-button-admin>
        <boo-button-admin (click)="print.emit()" background="transparent" textColor="rgb(var(--twc-secondary))" padding="8px 16px" [fontSize]="14" [radius]="8" fontWeight="500">Print</boo-button-admin>
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
