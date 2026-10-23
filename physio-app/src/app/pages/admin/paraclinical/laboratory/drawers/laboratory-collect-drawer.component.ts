import { NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BooButtonComponent, BooInputComponent } from '@physioboo/ui';
import { DrawerComponent } from "../../../../../components/drawer/drawer.component";
import { LabSample } from "../../../../../shared/types/laboratory.types";
import { LaboratoryDrawerShellComponent } from "./laboratory-drawer-shell.component";

export interface LabCollectForm {
  collectorName: string | null;
  containerType: string | null;
}

/** Backend limits: collector name 150 characters, container type 64. */
const MAX_COLLECTOR_LENGTH = 150;
const MAX_CONTAINER_LENGTH = 64;

@Component({
  selector: 'laboratory-collect-drawer',
  standalone: true,
  imports: [NgIf, FormsModule, DrawerComponent, BooButtonComponent, BooInputComponent, LaboratoryDrawerShellComponent],
  template: `
    <drawer [isOpen]="isOpen" (close)="requestClose()">
      <laboratory-drawer-shell *ngIf="isOpen && sample" title="Collect specimen" [subtitle]="sample.testName + ' · ' + sample.patientName" (close)="requestClose()">
        <form id="laboratory-collect-form" class="px-6 py-5 flex flex-col gap-4" (ngSubmit)="submit()" novalidate>
          <dl class="m-0 grid grid-cols-2 gap-3 text-sm">
            <div><dt class="text-gray-500">Order</dt><dd class="m-0 font-medium text-gray-800">{{ sample.orderNumber }}</dd></div>
            <div><dt class="text-gray-500">Barcode</dt><dd class="m-0 font-medium text-gray-800 break-all">{{ sample.barcode }}</dd></div>
            <div><dt class="text-gray-500">Specimen</dt><dd class="m-0 font-medium text-gray-800">{{ sample.sampleType }}</dd></div>
          </dl>

          <boo-input label="Container type" name="containerType" [maxlength]="containerMax" [(ngModel)]="containerType" [disabled]="submitting" />
          <div>
            <boo-input label="Collected by" name="collectorName" [maxlength]="collectorMax" [(ngModel)]="collectorName" [disabled]="submitting" />
            <p class="m-0 mt-1 text-xs text-secondary">Leave blank to record yourself as the collector.</p>
          </div>

          <p *ngIf="failed" class="m-0 text-sm text-danger" role="alert">The request failed. Your entries are kept — try again.</p>
        </form>

        <ng-container footer>
          <button boo-button variant="secondary" size="sm" type="button" [disabled]="submitting" (click)="requestClose()">Cancel</button>
          <button boo-button variant="primary" size="sm" type="submit" form="laboratory-collect-form" [loading]="submitting">Mark collected</button>
        </ng-container>
      </laboratory-drawer-shell>
    </drawer>
  `,
})
export class LaboratoryCollectDrawerComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() sample: LabSample | null = null;
  @Input() submitting = false;
  @Input() failed = false;
  @Output() confirm = new EventEmitter<LabCollectForm>();
  @Output() close = new EventEmitter<void>();

  readonly collectorMax = MAX_COLLECTOR_LENGTH;
  readonly containerMax = MAX_CONTAINER_LENGTH;
  collectorName = '';
  containerType = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.collectorName = '';
      this.containerType = this.sample?.containerType ?? '';
    }
  }

  submit(): void {
    if (this.submitting) return;
    this.confirm.emit({
      collectorName: this.collectorName.trim() || null,
      containerType: this.containerType.trim() || null,
    });
  }

  requestClose(): void {
    if (!this.submitting) this.close.emit();
  }
}
