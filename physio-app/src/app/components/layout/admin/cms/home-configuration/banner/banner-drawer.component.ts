import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { HomeBannerService } from "../../../../../../services/admin/home-banner.service";
import { LocalLoadingService } from "../../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING, SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING } from "../../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { Banner } from "../../../../../../shared/types/banner.types";
import { BooButtonAdminComponent } from "../../../../../button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../checkbox/boo-checkbox/boo-checkbox.component";
import { DrawerComponent } from "../../../../../drawer/drawer.component";
import { BooIconComponent } from "../../../../../icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooUploadComponent } from "../../../../../upload/boo-upload/boo-upload.component";

@Component({
    selector: 'home-config-banner-drawer',
    standalone: true,
    imports: [
        SharedModule,
        DrawerComponent,
        BooInputComponent,
        BooIconComponent,
        BooButtonAdminComponent,
        BooCheckboxComponent,
        BooUploadComponent
    ],
    template: `
        <drawer [isOpen]="isOpen" [isShowDialog]="true" [width]="720" (close)="onClose()">
            <div class="flex flex-col h-full bg-surface relative">
                <div class="flex-none px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-surface z-10 sticky top-0">
                    <div>
                        <h2 class="text-xl font-bold text-primary leading-none mb-1">
                            {{ currentId ? 'Edit Banner' : 'New Banner' }}
                        </h2>
                        <p class="text-sm text-secondary m-0">Configure a hero banner shown on the home page</p>
                    </div>
                    <button (click)="onClose()" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                        <boo-icon name="x" [size]="20"></boo-icon>
                    </button>
                </div>

                <div #scrollContainer class="flex-1 overflow-y-auto bg-surface" custom-scrollbar [formGroup]="form">
                    <div *ngIf="loadingSrv.isLoading('search-by-id') && currentId" class="absolute inset-0 bg-surface/80 z-50 flex items-center justify-center backdrop-blur-sm">
                        <boo-icon name="loader" class="animate-spin text-primary" [size]="32"></boo-icon>
                    </div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Content</h3>
                        <boo-input label="Title" [required]="true" formControlName="title" placeholder="Ex: Advanced Healthcare Solutions"></boo-input>
                        <boo-input label="Subtitle" formControlName="subtitle" placeholder="Ex: Experience world-class medical care..."></boo-input>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Image</h3>
                        <boo-upload label="Banner Image" formControlName="imageUrl" width="100%" height="160px" [radius]="12"></boo-upload>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 space-y-4">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Call to Action</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <boo-input label="Button Text" formControlName="buttonText" placeholder="e.g., Learn More"></boo-input>
                            <boo-input label="Button Link" formControlName="buttonLink" placeholder="e.g., /services"></boo-input>
                        </div>
                    </div>

                    <div class="h-px bg-gray-100 mx-6"></div>

                    <div class="p-6 pb-10">
                        <h3 class="text-xs font-bold text-secondary uppercase tracking-wider mb-4">Display</h3>
                        <div class="grid grid-cols-2 gap-4 items-end">
                            <boo-input type="number" label="Display Order" formControlName="order" placeholder="1"></boo-input>
                            <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all"
                                [ngClass]="form.get('active')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
                                (click)="toggleCheck('active')">
                                <span class="text-sm font-medium text-gray-700">Active</span>
                                <boo-checkbox formControlName="active"></boo-checkbox>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex-none px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between z-20 sticky bottom-0">
                    <button *ngIf="currentId" (click)="onDelete()" class="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1.5">
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                        Delete
                    </button>
                    <div class="flex gap-3 ml-auto">
                        <boo-button-admin background="transparent" (click)="onClose()">Cancel</boo-button-admin>
                        <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
                            Save Changes
                        </boo-button-admin>
                    </div>
                </div>
            </div>
        </drawer>
    `
})

export class HomeConfigBannerDrawerComponent implements OnChanges {
    // #region Inputs, Outputs, Properties
    @Input() isOpen = false;
    @Input() currentId: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saveSuccess = new EventEmitter<Banner>();
    @Output() delete = new EventEmitter<string>();
    @ViewChild('scrollContainer') scrollContainer!: ElementRef;
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private bannerSrv: HomeBannerService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.initForm();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!this.isOpen) return;

        if (changes['currentId'] && this.currentId) {
            this.loadDetail(this.currentId);
        } else if (!this.currentId) {
            this.resetForm();
        }
    }
    // #endregion

    // #region Methods
    private initForm(): FormGroup {
        return this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(150)]],
            subtitle: [''],
            imageUrl: [''],
            buttonText: [''],
            buttonLink: [''],
            order: [1, [Validators.required, Validators.min(1)]],
            active: [true]
        });
    }

    loadDetail(id: string) {
        this.form.disable();

        this.bannerSrv.search_by_id(id)
            .pipe(
                finalize(() => this.form.enable())
            )
            .subscribe(_res => {
                if (_res.success) {
                    this.form.patchValue({
                        title: _res.data?.title ?? '',
                        subtitle: _res.data?.subtitle ?? '',
                        imageUrl: _res.data?.imageUrl ?? '',
                        buttonText: _res.data?.buttonText ?? '',
                        buttonLink: _res.data?.buttonLink ?? '',
                        order: _res.data?.order ?? 1,
                        active: _res.data?.active ?? true
                    })
                }
            })
    }

    toggleCheck(controlName: string) {
        const currentValue = this.form.get(controlName)?.value;

        this.form.patchValue({
            [controlName]: !currentValue
        });
        this.form.markAsDirty();
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        const formData = { ...this.form.getRawValue() }

        try {
            let id: string;
            if (this.currentId) {
                await firstValueFrom(this.bannerSrv.update(this.currentId, formData));
                id = this.currentId;
            } else {
                const createRes = await firstValueFrom(this.bannerSrv.create(formData));
                if (!createRes.success || !createRes.data) {
                    this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
                    return;
                }
                id = createRes.data;
            }

            const response = await firstValueFrom(this.bannerSrv.search_by_id(id));
            if (response.success && response.data) {
                this.saveSuccess.emit(response.data);
            } else this.toastSrv.error(SEARCH_BY_ID_FAILED_AFTER_CREATING_OR_UPDATING);
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            return;
        }
    }

    resetForm() {
        this.form.reset({
            title: '',
            subtitle: '',
            imageUrl: '',
            buttonText: '',
            buttonLink: '',
            order: 1,
            active: true
        });
    }

    onClose() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = 0;
        }

        this.close.emit();
    }

    onDelete() {
        if (this.currentId) this.delete.emit(this.currentId);
    }
}
