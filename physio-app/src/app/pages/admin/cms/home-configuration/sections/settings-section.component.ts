import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, firstValueFrom } from "rxjs";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooCheckboxComponent } from "../../../../../components/checkbox/boo-checkbox/boo-checkbox.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { HomeSettingsService } from "../../../../../services/admin/home-settings.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../../shared/constants/error.constant";
import { SharedModule } from "../../../../../shared/shared-imports";

@Component({
    selector: 'home-config-settings-section',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        BooTextareaComponent,
        BooCheckboxComponent,
        BooButtonAdminComponent,
        BooIconComponent
    ],
    template: `
    <div class="bg-surface rounded-[6px] border border-gray-200 p-6 relative">
      <div *ngIf="loadingSrv.isLoading('search')" class="absolute inset-0 bg-surface/80 z-10 flex items-center justify-center backdrop-blur-sm rounded-[6px]">
        <boo-icon name="loader" class="animate-spin text-primary" [size]="28"></boo-icon>
      </div>

      <div [formGroup]="form" class="space-y-6 max-w-3xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <boo-input label="Hospital Name" [required]="true" formControlName="hospitalName" placeholder="Enter hospital name"></boo-input>
          <boo-input label="Tagline" formControlName="tagline" placeholder="Enter tagline"></boo-input>
        </div>

        <boo-textarea label="Welcome Message" formControlName="welcomeMessage" placeholder="Enter welcome message"></boo-textarea>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <boo-input type="tel" label="Contact Phone" formControlName="contactPhone" placeholder="Enter phone number"></boo-input>
          <boo-input type="email" label="Contact Email" formControlName="contactEmail" placeholder="Enter email address"></boo-input>
        </div>

        <boo-textarea label="Address" formControlName="address" placeholder="Enter hospital address"></boo-textarea>

        <div class="border rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all max-w-sm"
            [ngClass]="form.get('showEmergencyBanner')?.value ? 'border-primary bg-primary/5' : 'border-gray-200'"
            (click)="toggleCheck('showEmergencyBanner')">
          <span class="text-sm font-medium text-gray-700">Show Emergency Contact Banner on Home Page</span>
          <boo-checkbox formControlName="showEmergencyBanner"></boo-checkbox>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <boo-button-admin textColor="white" (click)="onSave()" [loading]="loadingSrv.isLoading('update')">
            Save Settings
          </boo-button-admin>
        </div>
      </div>
    </div>
    `,
    host: { class: 'block h-full min-h-0' }
})
export class HomeConfigSettingsSectionComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    form: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private fb: FormBuilder,
        private toastSrv: ToastService,
        private settingsSrv: HomeSettingsService,
        protected loadingSrv: LocalLoadingService
    ) {
        this.form = this.fb.group({
            hospitalName: ['', [Validators.required, Validators.maxLength(150)]],
            tagline: [''],
            welcomeMessage: [''],
            contactPhone: [''],
            contactEmail: ['', [Validators.email]],
            address: [''],
            showEmergencyBanner: [false]
        });
    }

    ngOnInit(): void {
        this.loadSettings();
    }
    // #endregion

    // #region Methods
    loadSettings() {
        this.form.disable();

        this.settingsSrv.get()
            .pipe(finalize(() => this.form.enable()))
            .subscribe(_res => {
                if (_res.success && _res.data) {
                    this.form.patchValue(_res.data);
                }
            });
    }

    toggleCheck(controlName: string) {
        const currentValue = this.form.get(controlName)?.value;
        this.form.patchValue({ [controlName]: !currentValue });
        this.form.markAsDirty();
    }

    async onSave() {
        if (this.form.invalid) {
            this.toastSrv.error('Please check required fields');
            this.form.markAllAsTouched();
            return;
        }

        try {
            const res = await firstValueFrom(this.settingsSrv.update(this.form.getRawValue()));
            if (res.success) {
                this.toastSrv.success('Settings saved successfully.');
            } else {
                this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
            }
        } catch (err) {
            this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        }
    }
    // #endregion
}
