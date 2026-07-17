import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { BooButtonAdminComponent } from "../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { DrawerComponent } from "../../../../components/drawer/drawer.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../components/input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { DepartmentService } from "../../../../services/admin/department.service";
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
        BooIconComponent,
        BooTextareaComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
        BooDatepickerComponent,
    ],
    template: `
    <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="560" (close)="onClose()">
      <div class="flex flex-col h-full bg-surface relative">
        <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
          <div>
            <h2 class="text-xl font-bold text-primary leading-none mb-1">{{ stockTake ? 'Edit Draft' : 'New Stock Take' }}</h2>
            <p class="text-sm text-secondary m-0">Define the scope and schedule for this inventory count</p>
          </div>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Close">
            <boo-icon name="x" [size]="20"></boo-icon>
          </button>
        </div>

        <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
          <div class="p-6 space-y-4">
            <boo-select label="Warehouse" formControlName="warehouseId" required
              [options]="warehouses" bindLabel="name" bindValue="id"></boo-select>

            <boo-select label="Department" formControlName="departmentId" required
              [options]="departments" bindLabel="name" bindValue="id"></boo-select>

            <boo-datepicker label="Scheduled Date" formControlName="scheduledDate"></boo-datepicker>

            <boo-select label="Assign Counter" formControlName="assignedTo"
              [options]="users" bindLabel="name" bindValue="id"></boo-select>

            <boo-textarea label="Notes" formControlName="notes" placeholder="Scope, focus areas, controlled drug reminders..."></boo-textarea>
          </div>
        </div>

        <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 z-20 sticky bottom-0">
          <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
          <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading(stockTake ? loadingKeys.UPDATE : loadingKeys.CREATE)">
            {{ stockTake ? 'Save Changes' : 'Create Stock Take' }}
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
    warehouses: Lookup[] = [];
    departments: Lookup[] = [];
    users: Lookup[] = [];
    readonly loadingKeys = LoadingKeys.STOCK_TAKE;

    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private srv: StockTakeService,
        private departmentSrv: DepartmentService,
        protected loadingSrv: LocalLoadingService,
    ) {
        this.form = this.fb.group({
            warehouseId: [null, [Validators.required]],
            departmentId: [null, [Validators.required]],
            scheduledDate: [null],
            assignedTo: [null],
            notes: [''],
        });
    }

    ngOnInit(): void {
        this.srv.getWarehouses().subscribe(res => { if (res.success) this.warehouses = res.data; });
        this.srv.getUsers().subscribe(res => { if (res.success) this.users = res.data; });
        this.departmentSrv.search({ pageNumber: 1, pageSize: 100 }).subscribe(res => {
            if (res.success) this.departments = res.data.items.map(d => ({ id: d.id, name: d.name }));
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['stockTake'] && this.stockTake) {
            this.form.patchValue({
                warehouseId: this.stockTake.warehouseId,
                departmentId: this.stockTake.departmentId,
                scheduledDate: this.stockTake.scheduledDate,
                assignedTo: this.stockTake.assignedTo,
                notes: this.stockTake.notes ?? '',
            });
        } else if (!this.stockTake) {
            this.resetForm();
        }
    }

    resetForm(): void {
        this.form.reset({ warehouseId: null, departmentId: null, scheduledDate: null, assignedTo: null, notes: '' });
    }

    async onSave(): Promise<void> {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const payload = { ...this.form.getRawValue() };

        try {
            if (this.stockTake) {
                await firstValueFrom(this.srv.update(this.stockTake.id, payload));
                this.toastSrv.success('Stock take draft updated');
            } else {
                await firstValueFrom(this.srv.create(payload));
                this.toastSrv.success('Stock take created as Draft');
            }
            this.saveSuccess.emit();
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }

    onClose(): void {
        if (this.scrollContainer) this.scrollContainer.nativeElement.scrollTop = 0;
        this.close.emit();
    }
}
