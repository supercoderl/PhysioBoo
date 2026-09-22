import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BooButtonComponent } from '../../../components/button/boo-button/boo-button.component';
import { FormWrapperComponent } from "../../../components/form/boo-form/boo-form.component";
import { BooIconComponent } from "../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from '../../../components/input/boo-input/boo-input.component';
import { BooSelectComponent } from "../../../components/select/boo-select/boo-select.component";
import { LocalLoadingService } from '../../../services/common/local-loading.service';
import { ToastService } from '../../../services/common/toast.service';
import { TenantOnboardingService } from '../../../services/admin/tenant-onboarding.service';
import { HospitalType } from '../../../shared/enums/hospital-type';
import { SharedModule } from '../../../shared/shared-imports';
import { RegisterTenantRequest } from '../../../shared/types/tenant.types';

@Component({
  selector: 'app-register-tenant',
  standalone: true,
  imports: [
    SharedModule,
    FormWrapperComponent,
    BooButtonComponent,
    BooInputComponent,
    BooSelectComponent,
    BooIconComponent
  ],
  template: `
    <div class="bg-surface">
      <div class="py-20 md:py-15 flex md:items-center min-h-screen overflow-y-auto flex-wrap relative">
        <div class="container mx-auto">
          <div class="flex justify-center w-full">
            <div class="w-full relative bg-surface shadow-lg p-5 rounded-2.5 md:w-1/2">
              <div class="mb-5">
                <h3 class="text-[28px] mb-2 font-semibold text-primary leading-[1.2] text-center">
                  Register Your Company
                </h3>
                <p class="mb-2.5 text-xs15 text-brandDark text-center">
                  Create your organization and get started with Physio Boo
                </p>
              </div>

              <div class="flex items-center justify-center gap-6 mb-6">
                <div *ngFor="let s of [1, 2, 3]; let i = index" class="flex items-center gap-6">
                  <div class="flex flex-col items-center gap-1">
                    <div
                      class="w-8 h-8 rounded-full flex items-center justify-center text-xs14 font-semibold transition-smooth"
                      [ngClass]="step >= s ? 'bg-primary text-white' : 'bg-gray-100 text-brandDark'"
                    >
                      {{ s }}
                    </div>
                    <span class="text-xs12 text-brandDark">{{ stepLabels[i] }}</span>
                  </div>
                  <div *ngIf="s < 3" class="w-10 h-px" [ngClass]="step > s ? 'bg-primary' : 'bg-gray-200'"></div>
                </div>
              </div>

              <form boo-form [formGroup]="activeForm" (validSubmit)="onStepSubmit()">
                <!-- Step 1 — Company -->
                <div *ngIf="step === 1" [formGroup]="companyForm" class="space-y-4">
                  <boo-input label="Company Name" formControlName="name" [required]="true" booError></boo-input>
                  <boo-input label="Description" formControlName="description"></boo-input>
                  <boo-input label="Headquarters Address" formControlName="headquartersAddress"></boo-input>
                  <div class="grid grid-cols-2 gap-4">
                    <boo-input label="Phone" formControlName="phone"></boo-input>
                    <boo-input label="Email" formControlName="email" booError></boo-input>
                  </div>
                  <boo-input label="Website" formControlName="website"></boo-input>
                </div>

                <!-- Step 2 — Branches -->
                <div *ngIf="step === 2" [formGroup]="branchesGroup" class="space-y-4">
                  <div
                    *ngFor="let branch of branches.controls; let i = index"
                    [formGroup]="asFormGroup(branch)"
                    class="border border-gray-200 rounded-xl p-4 relative"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs14 font-semibold text-primary">Branch {{ i + 1 }}</span>
                      <button
                        *ngIf="branches.length > 1"
                        type="button"
                        (click)="removeBranch(i)"
                        class="text-red-500 hover:text-red-700"
                      >
                        <boo-icon name="trash-2" [size]="16"></boo-icon>
                      </button>
                    </div>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                      <boo-input label="Branch Name" formControlName="name" [required]="true" booError></boo-input>
                      <boo-select label="Type" formControlName="hospitalType" [options]="hospitalTypeOptions"></boo-select>
                    </div>
                    <boo-input label="Address" formControlName="address" [required]="true" booError class="block mb-4"></boo-input>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                      <boo-input label="City" formControlName="city" [required]="true" booError></boo-input>
                      <boo-input label="State / Province" formControlName="stateProvince" [required]="true" booError></boo-input>
                      <boo-input label="Country" formControlName="country" [required]="true" booError></boo-input>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <boo-input label="Phone" formControlName="phone"></boo-input>
                      <boo-input label="Email" formControlName="email"></boo-input>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="addBranch()"
                    class="w-full border border-dashed border-gray-300 rounded-xl py-2.5 text-xs14 text-primary font-medium hover:bg-primary/5 transition-smooth"
                  >
                    + Add another branch
                  </button>
                </div>

                <!-- Step 3 — Owner -->
                <div *ngIf="step === 3" [formGroup]="ownerForm" class="space-y-4">
                  <boo-input label="Your E-mail" formControlName="email" [required]="true" booError></boo-input>
                  <boo-input label="Your Phone" formControlName="phone" [required]="true" booError></boo-input>
                  <div class="relative">
                    <boo-input
                      label="Password"
                      formControlName="password"
                      [required]="true"
                      [type]="passwordType"
                      booError
                    >
                      <boo-icon
                        [name]="passwordType === 'text' ? 'eye' : 'eye-off'"
                        class="leading-none absolute top-1/2 -translate-y-1/2 right-2.5 stroke-brandDark cursor-pointer"
                        endfix
                        (click)="onTogglePassword()"
                      ></boo-icon>
                    </boo-input>
                  </div>
                </div>

                <div class="flex gap-3 mt-6">
                  <button
                    *ngIf="step > 1"
                    boo-button
                    type="button"
                    label="Back"
                    background="transparent"
                    classname="!text-primary !border !border-primary flex-1 !py-3 font-bold uppercase"
                    [radius]="5"
                    (click)="onBack()"
                  ></button>
                  <button
                    boo-button
                    [label]="step < 3 ? 'Next' : 'Create Company'"
                    classname="flex-1 !py-3 font-bold uppercase"
                    [radius]="5"
                    [loading]="loadingSrv.isLoading('register-tenant')"
                  ></button>
                </div>
              </form>

              <div class="text-center mt-6">
                <p class="m-0 text-xs15 text-brandDark">
                  Already have an account?
                  <a routerLink="/auth/login" class="font-medium text-secondary cursor-pointer transition-smooth">
                    Login
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterTenantComponent {
  // #region Inputs, Outputs, Properties
  step: 1 | 2 | 3 = 1;
  stepLabels = ['Company', 'Branches', 'Owner'];
  passwordType: 'text' | 'password' = 'password';

  companyForm: FormGroup;
  branchesGroup: FormGroup;
  ownerForm: FormGroup;

  readonly hospitalTypeOptions = [
    { label: 'General Hospital', value: HospitalType.GeneralHospital },
    { label: 'Specialist Hospital', value: HospitalType.SpecialistHospital },
    { label: 'Polyclinic', value: HospitalType.Polyclinic },
    { label: 'Clinic', value: HospitalType.Clinic },
    { label: 'Emergency Center', value: HospitalType.EmergencyCenter },
    { label: 'Rehabilitation Center', value: HospitalType.RehabilitationCenter },
    { label: 'Maternity Hospital', value: HospitalType.MaternityHospital },
    { label: 'Pediatric Hospital', value: HospitalType.PediatricHospital },
  ];
  // #endregion

  // #region Init (Lifecycle + Setup)
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastSrv: ToastService,
    private tenantSrv: TenantOnboardingService,
    protected loadingSrv: LocalLoadingService
  ) {
    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      headquartersAddress: [''],
      website: [''],
      phone: [''],
      email: ['', Validators.email],
      logoUrl: [''],
      establishedDate: [null],
      licenseNumber: [''],
      accreditationDetails: ['']
    });

    this.branchesGroup = this.fb.group({
      branches: this.fb.array([this.createBranchGroup()])
    });

    this.ownerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get activeForm(): FormGroup {
    if (this.step === 1) return this.companyForm;
    if (this.step === 2) return this.branchesGroup;
    return this.ownerForm;
  }

  get branches(): FormArray {
    return this.branchesGroup.get('branches') as FormArray;
  }
  // #endregion

  // #region Methods
  private createBranchGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      hospitalType: [HospitalType.GeneralHospital, Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      stateProvince: ['', Validators.required],
      country: ['', Validators.required],
      phone: [''],
      email: ['', Validators.email]
    });
  }

  asFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  addBranch(): void {
    this.branches.push(this.createBranchGroup());
  }

  removeBranch(index: number): void {
    if (this.branches.length <= 1) return;
    this.branches.removeAt(index);
  }

  onBack(): void {
    if (this.step > 1) this.step = (this.step - 1) as 1 | 2 | 3;
  }

  onTogglePassword(): void {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  onStepSubmit(): void {
    if (this.step < 3) {
      this.step = (this.step + 1) as 1 | 2 | 3;
      return;
    }

    this.submitRegistration();
  }

  private submitRegistration(): void {
    if (this.companyForm.invalid || this.branchesGroup.invalid || this.ownerForm.invalid) {
      this.toastSrv.error('Please check required fields on every step.');
      this.companyForm.markAllAsTouched();
      this.branchesGroup.markAllAsTouched();
      this.ownerForm.markAllAsTouched();
      return;
    }

    const payload: RegisterTenantRequest = {
      company: this.companyForm.value,
      branches: this.branches.value.map((branch: any) => ({
        ...branch,
        emergencyCapacity: 0,
        operationTheaters: 0,
        // Deliberately not collected in the wizard — see tenant.types.ts and
        // docs/tenant-onboarding-redesign.md for why these are sent empty.
        accreditationBody: '',
        insuranceAccepted: [],
        languagesSupported: []
      })),
      owner: this.ownerForm.value
    };

    this.loadingSrv.setLoading('register-tenant', true);
    this.tenantSrv.registerTenant(payload).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading('register-tenant', false);
        if (res.success) {
          this.router.navigate(['/auth/verify-required']);
        } else {
          this.toastSrv.error('Registration failed. Please check your information and try again.');
        }
      },
      error: () => {
        this.loadingSrv.setLoading('register-tenant', false);
        this.toastSrv.error('System error occurred. Please try again.');
      }
    });
  }
  // #endregion
}
