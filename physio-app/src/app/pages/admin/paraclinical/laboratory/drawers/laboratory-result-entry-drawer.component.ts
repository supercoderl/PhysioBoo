import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../../components/drawer/drawer.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { LaboratoryDrawerShellComponent } from "./laboratory-drawer-shell.component";

/** What the drawer needs to know about the test being resulted. Unit and range are only shown when the server supplied them. */
export interface LabResultTarget {
  id: string;
  testName: string;
  patientName: string;
  orderNumber: string;
  unit: string | null;
  referenceRange: string | null;
  value: string;
  comments: string | null;
}

export interface LabResultForm {
  value: string;
  comments: string | null;
}

/** Backend limits: value 200 characters, comments 2000. */
const MAX_VALUE_LENGTH = 200;
const MAX_COMMENTS_LENGTH = 2000;

/**
 * Enters or corrects one result value. The server computes the abnormal flag from the reference range and resets
 * any earlier verification, so the value is submitted exactly as typed (precision is never reformatted).
 */
@Component({
  selector: 'laboratory-result-entry-drawer',
  standalone: true,
  imports: [NgIf, FormsModule, DrawerComponent, BooButtonComponent, BooInputComponent, BooTextareaComponent, LaboratoryDrawerShellComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="requestClose()">
      <laboratory-drawer-shell *ngIf="isOpen && target" [title]="target.value ? 'Edit result' : 'Enter result'"
        [subtitle]="target.testName + ' · ' + target.patientName" (close)="requestClose()">
        <form id="laboratory-result-form" class="px-6 py-5 flex flex-col gap-4" (ngSubmit)="submit()" novalidate>
          <dl class="m-0 grid grid-cols-2 gap-3 text-sm">
            <div><dt class="text-gray-500">Order</dt><dd class="m-0 font-medium text-gray-800">{{ target.orderNumber }}</dd></div>
            <div *ngIf="target.unit"><dt class="text-gray-500">Unit</dt><dd class="m-0 font-medium text-gray-800">{{ target.unit }}</dd></div>
            <div *ngIf="target.referenceRange" class="col-span-2"><dt class="text-gray-500">Reference range</dt><dd class="m-0 font-medium text-gray-800">{{ target.referenceRange }}</dd></div>
          </dl>

          <div>
            <boo-input label="Result value" name="value" [required]="true" [maxlength]="valueMax" [(ngModel)]="value" [disabled]="submitting" />
            <p *ngIf="attempted && !value.trim()" class="m-0 mt-1 text-xs text-danger" role="alert">A result value is required.</p>
          </div>

          <div>
            <boo-textarea label="Comments" name="comments" [rows]="3" [maxlength]="commentsMax" [(ngModel)]="comments" [disabled]="submitting" />
            <p class="m-0 mt-1 text-xs text-secondary text-right tabular-nums">{{ comments.length }} / {{ commentsMax }}</p>
          </div>

          <p class="m-0 text-xs text-secondary">The abnormal flag is calculated by the laboratory system when you save. Saving a result sends it for verification.</p>
          <p *ngIf="failed" class="m-0 text-sm text-danger" role="alert">The request failed. Your entries are kept — try again.</p>
        </form>

        <ng-container footer>
          <button boo-button variant="secondary" size="sm" type="button" [disabled]="submitting" (click)="requestClose()">Cancel</button>
          <button boo-button variant="primary" size="sm" type="submit" form="laboratory-result-form" [loading]="submitting">Save result</button>
        </ng-container>
      </laboratory-drawer-shell>
    </drawer>
  `,
})
export class LaboratoryResultEntryDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() target: LabResultTarget | null = null;
  @Input() submitting = false;
  @Input() failed = false;
  @Output() confirm = new EventEmitter<LabResultForm>();
  @Output() close = new EventEmitter<void>();

  readonly valueMax = MAX_VALUE_LENGTH;
  readonly commentsMax = MAX_COMMENTS_LENGTH;
  value = '';
  comments = '';
  attempted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.value = this.target?.value ?? '';
      this.comments = this.target?.comments ?? '';
      this.attempted = false;
    }
  }

  submit(): void {
    this.attempted = true;
    const value = this.value.trim();
    if (!value || this.submitting) return;
    this.confirm.emit({ value, comments: this.comments.trim() || null });
  }

  requestClose(): void {
    if (!this.submitting) this.close.emit();
  }
}
