import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { MenuService } from "../../../../../services/admin/menu.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MenuItem } from "../../../../../shared/types/menu";
import { BooButtonAdminComponent } from "../../../../button/boo-button-admin/boo-button-admin.component";
import { DrawerComponent } from "../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";

@Component({
    selector: 'setting-admin-menu-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooButtonAdminComponent,
        BooSelectComponent,
    ],
    template: `
        <drawer
            [isOpen]="isOpen"
            [isShowDialog]="true"
            [width]="720"
            (close)="onClose()"
        >
            <div class="flex flex-col h-full bg-surface relative">
                <!-- Header -->
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentItem ? 'Edit Menu Item' : 'New Menu Item' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">
                            {{ parentId && !currentItem ? 'Adding child under: ' + parentLabel : 'Configure menu item details' }}
                        </p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <!-- Loading overlay when fetching detail -->
                <div *ngIf="loadingSrv.isLoading('search-by-id') && currentItem" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                    <boo-icon name="loader-circle" class="animate-spin text-primary" [size]="32"></boo-icon>
                </div>

                <!-- Form body -->
                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <!-- Basic info -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Basic Information</h3>

                        <boo-input
                            label="Label"
                            [required]="true"
                            formControlName="label"
                            placeholder="e.g. Dashboard"
                        ></boo-input>

                        <div class="grid grid-cols-2 gap-4">
                            <boo-input
                                label="Icon Name"
                                formControlName="icon"
                                placeholder="e.g. gauge"
                            ></boo-input>

                            <boo-input
                                label="Route"
                                formControlName="route"
                                placeholder="e.g. overview/dashboard"
                            ></boo-input>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <boo-input
                                type="number"
                                label="Order"
                                formControlName="order"
                                placeholder="0"
                            ></boo-input>

                            <boo-select
                                label="Parent Menu"
                                formControlName="parentId"
                                [options]="parentOptions"
                            ></boo-select>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <!-- Permissions -->
                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Access & Visibility</h3>

                        <!-- Active toggle -->
                        <div
                            class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:border-primary/50"
                            [ngClass]="{'border-primary bg-primary/5': form.get('isActive')?.value, 'border-gray-200': !form.get('isActive')?.value}"
                            (click)="toggleActive()"
                        >
                            <div class="flex items-center gap-2">
                                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <boo-icon name="circle-check" [size]="16" color="#16a34a"></boo-icon>
                                </div>
                                <div>
                                    <span class="text-sm font-medium text-gray-700 block">Active</span>
                                    <span class="text-xs text-secondary">Visible to users with permission</span>
                                </div>
                            </div>
                            <nz-switch formControlName="isActive"></nz-switch>
                        </div>

                        <!-- Permission codes -->
                        <div>
                            <label class="text-xs font-semibold text-secondary block mb-2">Permission Codes</label>
                            <boo-input
                                label="Code..."
                                formControlName="permissionCode"
                                placeholder="e.g. code"
                            ></boo-input>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0 shadow-top-md">
                    <div>
                        <button
                            *ngIf="currentItem"
                            class="group flex items-center gap-1.5 text-red-500 hover:text-red-700 px-2 py-1.5 rounded-md hover:bg-red-50 transition-all text-sm font-medium"
                            (click)="onDelete()"
                        >
                            <boo-icon name="trash-2" [size]="16" color="#ef4444" class="transition-transform group-hover:scale-110"></boo-icon>
                            <span>Delete</span>
                        </button>
                    </div>
                    <div class="flex gap-3">
                        <boo-button-admin
                            buttonClass="hover:!bg-gray-200"
                            background="transparent"
                            (click)="onClose()"
                            [disabled]="loadingSrv.isLoading('search-by-id')"
                        >
                            Cancel
                        </boo-button-admin>
                        <boo-button-admin
                            textColor="white"
                            (click)="onSave()"
                            [disabled]="loadingSrv.isLoading('search-by-id')"
                            [loading]="loadingSrv.isLoading('create') || loadingSrv.isLoading('update')"
                        >
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})
export class SettingAdminMenuDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentItem: MenuItem | null = null;
    @Input() parentId: string | null = null;
    @Input() allMenus: MenuItem[] = [];
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<MenuItem>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;

    form: FormGroup;
    parentLabel = '';
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private menuSrv: MenuService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['currentItem'] && this.currentItem) {
            this.loadDetail(this.currentItem.id);
        } else if (changes['isOpen'] && !this.currentItem) {
            this.resetForm();
            if (this.parentId) {
                const parent = this.allMenus.find(m => m.id === this.parentId);
                this.parentLabel = parent?.label ?? '';
                this.form.patchValue({ parentId: this.parentId });
            }
        }
    }
    // #endregion

    // #region Methods
    get parentOptions() {
        return this.allMenus.map(m => ({ label: m.label, value: m.id }));
    }

    private initForm(): FormGroup {
        return this.fb.group({
            label: ['', [Validators.required]],
            icon: [''],
            route: [''],
            order: [0],
            isActive: [true],
            parentId: [null],
            permissionCode: ['']
        });
    }

    private resetForm() {
        this.form.reset({
            label: '',
            icon: '',
            route: '',
            order: 0,
            isActive: true,
            parentId: null,
            permissionCode: ''
        });
    }

    loadDetail(id: string) {
        this.form.disable();
        this.menuSrv.search_by_id(id)
            .pipe(finalize(() => this.form.enable()))
            .subscribe(_res => {
                if (_res.success && _res.data) {
                    this.form.patchValue({
                        label: _res.data.label,
                        icon: _res.data.icon,
                        route: _res.data.route,
                        order: _res.data.order,
                        isActive: _res.data.isActive,
                        permissionCode: _res.data.permissionCode ?? ''
                    });
                }
            });
    }

    toggleActive() {
        this.form.patchValue({ isActive: !this.form.get('isActive')?.value });
        this.form.markAsDirty();
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields.');
            this.form.markAllAsTouched();
            return;
        }

        const raw = this.form.getRawValue();
        const payload = { ...raw };

        try {
            let id: string;
            if (this.currentItem) {
                const updateRes = await firstValueFrom(this.menuSrv.update(this.currentItem.id, payload));
                if (!updateRes.success) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = this.currentItem.id;
            } else {
                const createRes = await firstValueFrom(this.menuSrv.create(payload));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.menuSrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else {
                this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
            }
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    onClose() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }
        this.close.emit();
    }

    onDelete() {
        if (this.currentItem) this.delete.emit(this.currentItem.id);
    }
    // #endregion
}
