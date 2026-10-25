import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooInputComponent } from '@physioboo/ui';
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { StockTakeService } from "../../../../services/admin/stock-take.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { Lookup } from "../../../../shared/types/common";
import { StockTake } from "../../../../shared/types/stock-take.types";
import { LoadingKeys } from "../../../../shared/types/loading";

@Component({
    selector: 'stock-take-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooDatepickerComponent,
    ],
    template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="true" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative" role="dialog" aria-modal="true" aria-labelledby="stock-take-drawer-title" (keydown.escape)="onClose()">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div>
            <h2 id="stock-take-drawer-title" class="text-xl font-bold text-regular leading-none mb-1">{{ stockTake ? 'Edit draft' : 'New stock take' }}</h2>
            <p class="text-sm text-secondary m-0">Counting snapshots every active medicine batch of the warehouse when it starts.</p>
          </div>
          <button (click)="onClose()" class="text-gray-500 hover:text-gray-700 w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <physio-icon name="x" [size]="20"></physio-icon>
          </button>
        </div>

        <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
          <div class="p-6 space-y-4">
            <boo-select label="Warehouse" formControlName="warehouseId" required
              [options]="warehouses" bindLabel="name" bindValue="id"></boo-select>
            <p *ngIf="stockTake" class="m-0 -mt-2 text-xs text-secondary">The warehouse of an existing session cannot be changed.</p>

            <boo-select label="Department" formControlName="departmentId" required
              [options]="departments" bindLabel="name" bindValue="id"></boo-select>

            <boo-datepicker label="Scheduled date" formControlName="scheduledDate" required></boo-datepicker>

            <boo-select label="Counter" formControlName="assignedTo"
              [options]="users" bindLabel="name" bindValue="id"></boo-select>
            <p *ngIf="stockTake" class="m-0 -mt-2 text-xs text-secondary">The current counter is not returned by the API: saving without choosing one clears the assignment.</p>

            <boo-textarea label="Notes" formControlName="notes" placeholder="Scope, focus areas, controlled drug reminders..."></boo-textarea>
          </div>
        </div>

        <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 z-20 sticky bottom-0">
          <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
          <boo-button-admin textColor="white" (click)="onSave()" [disabled]="saving" [loading]="saving || loadingSrv.isLoading(stockTake ? loadingKeys.UPDATE : loadingKeys.CREATE)">
            {{ stockTake ? 'Save changes' : 'Create stock take' }}
          </boo-button-admin>
        </div>
      </div>
    </drawer>
  `,
})
export class StockTakeDrawerComponent implements OnInit, OnChanges {
    @Input() isOpen = false;
    @Input() stockTake: StockTake | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<void>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    form: FormGroup;
    saving = false;
    @Input() warehouses: Lookup[] = [];
    @Input() departments: Lookup[] = [];
    users: Lookup[] = [];
    readonly loadingKeys = LoadingKeys.STOCK_TAKE;

    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private srv: StockTakeService,
        protected loadingSrv: LocalLoadingService,
    ) {
        this.form = this.fb.group({
            warehouseId: [null, [Validators.required]],
            departmentId: [null, [Validators.required]],
            scheduledDate: [null, [Validators.required]],
            assignedTo: [null],
            notes: [''],
        });
    }

    ngOnInit(): void {
        this.srv.getUsers().subscribe({ next: users => this.users = users, error: () => { } });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['stockTake'] && this.stockTake) {
            this.form.patchValue({
                warehouseId: this.stockTake.warehouseId,
                departmentId: this.stockTake.departmentId,
                scheduledDate: this.stockTake.scheduledDate,
                assignedTo: null,
                notes: this.stockTake.notes ?? '',
            });
            this.form.controls['warehouseId'].disable();
        } else if (!this.stockTake) {
            this.resetForm();
        }
    }

    resetForm(): void {
        this.form.controls['warehouseId'].enable();
        this.form.reset({ warehouseId: null, departmentId: null, scheduledDate: null, assignedTo: null, notes: '' });
    }

    async onSave(): Promise<void> {
        if (this.saving) return;
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const payload = { ...this.form.getRawValue() };

        this.saving = true;
        try {
            if (this.stockTake) {
                await firstValueFrom(this.srv.update(this.stockTake.id, payload));
                this.toastSrv.success('Draft updated');
            } else {
                await firstValueFrom(this.srv.create(payload));
                this.toastSrv.success('Stock take created as a draft');
            }
            this.saveSuccess.emit();
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        } finally {
            this.saving = false;
        }
    }

    onClose(): void {
        if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = 0;
        this.close.emit();
    }
}
