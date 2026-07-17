import { Component, computed, Signal, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooInputComponent } from "../../../../components/input/boo-input/boo-input.component";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { PatientService } from "../../../../services/admin/patient.service";
import { PrintService } from "../../../../services/common/print.service";
import { randomEmail, randomPhone, randomText } from "../../../../services/common/random.service";
import { ToastService } from "../../../../services/common/toast.service";
import { CATCH_ERROR_AFTER_CREATING_OR_UPDATING } from "../../../../shared/constants/error.constant";
import { DEFAULT_DOCTOR_ID } from "../../../../shared/constants/value.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { CreatePatientRequest } from "../../../../shared/types/patient.types";

type StepId = 'personal' | 'contact' | 'medical' | 'review';

interface Step {
  id: StepId;
  label: string;
  icon: string;
  description: string;
  fields: string[];
}

@Component({
  selector: 'admin-registration',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    AdminContentHeaderComponent,
    BooInputComponent,
    BooDatepickerComponent,
    BooSelectComponent,
    BooIconComponent
  ],
  host: { class: 'block h-full min-h-0' },
  templateUrl: './registration.component.html'
})
export class AdminRegistrationComponent {
  // #Inputs, Outputs, Properties
  form: FormGroup;
  formValue: Signal<any>;

  steps: Step[] = [
    {
      id: 'personal', label: 'Personal', icon: 'user', description: 'Name, DOB, gender',
      fields: ['firstName', 'lastName', 'dateOfBirth', 'gender']
    },
    {
      id: 'contact', label: 'Contact', icon: 'mail', description: 'Email, phone, address',
      fields: ['email', 'phone', 'emergencyContactName', 'emergencyContactPhone', 'address', 'city', 'postalCode']
    },
    {
      id: 'medical', label: 'Medical', icon: 'stethoscope', description: 'History, insurance, primary doctor',
      fields: ['primaryDoctorId']
    },
    {
      id: 'review', label: 'Review', icon: 'circle-check', description: 'Confirm & register',
      fields: ['agreeToTerms']
    }
  ];

  incomeRangeOptions = [
    { label: 'Under $10,000',       value: 'under-10k' },
    { label: '$10,000 – $30,000',   value: '10k-30k' },
    { label: '$30,000 – $60,000',   value: '30k-60k' },
    { label: '$60,000 – $100,000',  value: '60k-100k' },
    { label: 'Over $100,000',       value: 'over-100k' },
    { label: 'Prefer not to say',   value: 'undisclosed' },
  ];

  appointmentTimeOptions = [
    { label: 'Morning (8:00–12:00)',   value: 'morning' },
    { label: 'Afternoon (12:00–17:00)', value: 'afternoon' },
    { label: 'Evening (17:00–20:00)',   value: 'evening' },
    { label: 'Any time',                value: 'any' },
  ];

  communicationOptions = [
    { label: 'Email',          value: 'email' },
    { label: 'SMS',            value: 'sms' },
    { label: 'Phone call',     value: 'phone' },
    { label: 'In-app',         value: 'in-app' },
  ];

  currentStepIdx = signal(0);
  submitting = signal(false);
  registeredPatientId = signal<string | null>(null);

  genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];
  bloodGroupOptions = [
    { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
    { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
    { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' }
  ];
  maritalOptions = [
    { label: 'Single', value: 'single' },
    { label: 'Married', value: 'married' },
    { label: 'Divorced', value: 'divorced' },
    { label: 'Widowed', value: 'widowed' }
  ];

  currentStep = computed(() => this.steps[this.currentStepIdx()]);
  progress = computed(() => ((this.currentStepIdx() + 1) / this.steps.length) * 100);
  fullName = computed(() => {
    const v = this.formValue();
    return [v.firstName, v.lastName].filter(Boolean).join(' ') || '—';
  });
  initials = computed(() => {
    const v = this.formValue();
    const a = (v.firstName || '').trim().charAt(0).toUpperCase();
    const b = (v.lastName || '').trim().charAt(0).toUpperCase();
    return (a + b) || '?';
  });
  ageFromDob = computed(() => {
    const dob = this.formValue().dateOfBirth;
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 0 && age < 150 ? age : null;
  });

  isStepValid = (idx: number): boolean => {
    return this.steps[idx].fields.every(name => this.form.get(name)?.valid);
  };

  isFieldInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
  // #endregion

  // #region Init (Lifecycle + Setups)
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastSrv: ToastService,
    private printSrv: PrintService,
    private patientSrv: PatientService
  ) {
    this.form = this.fb.group({
      // Personal
      firstName:     this.fb.nonNullable.control(randomText(6), Validators.required),
      lastName:      this.fb.nonNullable.control(randomText(6), Validators.required),
      dateOfBirth:   this.fb.nonNullable.control<string | null>(null, Validators.required),
      gender:        this.fb.nonNullable.control(0, Validators.required),
      bloodGroup:    this.fb.nonNullable.control(0),
      maritalStatus: this.fb.nonNullable.control(0),

      // Contact
      email:                 this.fb.nonNullable.control(randomEmail(), [Validators.required, Validators.email]),
      phone:                 this.fb.nonNullable.control(randomPhone(), [Validators.required, Validators.pattern(/^[+\d][\d\s().-]{6,}$/)]),
      emergencyContactName:  this.fb.nonNullable.control(randomText(8), Validators.required),
      emergencyContactPhone: this.fb.nonNullable.control(randomPhone(), [Validators.required, Validators.pattern(/^[+\d][\d\s().-]{6,}$/)]),
      address:               this.fb.nonNullable.control(randomText(15), Validators.required),
      city:                  this.fb.nonNullable.control(randomText(6), Validators.required),
      postalCode:            this.fb.nonNullable.control(randomText(6), Validators.required),

      // Medical narratives
      allergyInformation:  this.fb.nonNullable.control(''),
      medicalHistory:      this.fb.nonNullable.control(''),
      familyHistory:       this.fb.nonNullable.control(''),
      surgicalHistory:     this.fb.nonNullable.control(''),
      currentMedications:  this.fb.nonNullable.control(''),
      lifestyleNotes:      this.fb.nonNullable.control(''),

      // Patient profile (server DTO fields)
      primaryDoctorId:     this.fb.control<string | null>(DEFAULT_DOCTOR_ID, Validators.required),
      referredBy:          this.fb.control<string | null>(null),
      referralHospitalId:  this.fb.control<string | null>(null),

      // Insurance (note server typo: "Inssurance")
      insuranceProvider:        this.fb.nonNullable.control(''),
      insurancePolicyNumber:    this.fb.nonNullable.control(''),
      insuranceExpiryDate:      this.fb.control<string | null>(null),
      insuranceCoverageAmount:  this.fb.control<number | null>(null),

      // Demographics & preferences
      occupation:               this.fb.nonNullable.control(''),
      annualIncomeRange:        this.fb.nonNullable.control(''),
      preferredHospitalId:      this.fb.control<string | null>(null),
      preferredDoctorId:        this.fb.control<string | null>(null),
      preferredAppointmentTime: this.fb.nonNullable.control(''),
      communicationPreferences: this.fb.nonNullable.control(''),

      // Terms (review step)
      agreeToTerms: this.fb.nonNullable.control(false, Validators.requiredTrue),
    });

    this.formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  }

  // #endregion

  // #region Navigation
  goTo(idx: number): void {
    if (idx < this.currentStepIdx()) {
      this.currentStepIdx.set(idx);
      return;
    }
    for (let i = this.currentStepIdx(); i < idx; i++) {
      if (!this.isStepValid(i)) {
        this.markStepTouched(i);
        this.currentStepIdx.set(i);
        this.toastSrv.error('Please complete the current step first');
        return;
      }
    }
    this.currentStepIdx.set(idx);
  }

  next(): void {
    const idx = this.currentStepIdx();
    if (!this.isStepValid(idx)) {
      this.markStepTouched(idx);
      this.toastSrv.error('Please complete all required fields');
      return;
    }
    if (idx < this.steps.length - 1) this.currentStepIdx.set(idx + 1);
  }

  prev(): void {
    if (this.currentStepIdx() > 0) this.currentStepIdx.set(this.currentStepIdx() - 1);
  }

  private markStepTouched(idx: number): void {
    for (const f of this.steps[idx].fields) {
      this.form.get(f)?.markAsTouched();
    }
  }
  // #endregion

  // #region Submit
  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastSrv.error('Please complete all required fields');
      const firstInvalidStep = this.steps.findIndex((_, i) => !this.isStepValid(i));
      if (firstInvalidStep >= 0) this.currentStepIdx.set(firstInvalidStep);
      return;
    }

    this.submitting.set(true);
    try {
      const createRes = await firstValueFrom(this.patientSrv.create(this.buildRequestBody()));
      if (!createRes?.success || !createRes.data) {
        this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
        return;
      }
      const patientId = createRes.data;
      this.registeredPatientId.set(patientId);
      this.toastSrv.success(`Patient ${this.fullName()} registered (${patientId})`);
    } catch {
      this.toastSrv.error(CATCH_ERROR_AFTER_CREATING_OR_UPDATING);
    } finally {
      this.submitting.set(false);
    }
  }

  /**
   * Maps the form value to the server's CreatePatientCommand DTO.
   * Note: server uses the misspelling "Inssurance*" — frontend property names match.
   */
  private buildRequestBody(): CreatePatientRequest {
    const v = this.formValue();
    return ({
      // Profile / contact (sent as a wrapper — backend handles User/Profile creation)
      profile: {
        firstName: v.firstName,
        lastName: v.lastName,
        dateOfBirth: v.dateOfBirth,           // 'yyyy-MM-dd'
        gender: v.gender,
        bloodGroup: v.bloodGroup || null,
        maritalStatus: v.maritalStatus || null,
        email: v.email,
        phone: v.phone,
        emergencyContactName: v.emergencyContactName,
        emergencyContactPhone: v.emergencyContactPhone,
        address: v.address,
        city: v.city,
        postalCode: v.postalCode,
      },

      // Patient — fields matching the server CreatePatientCommand
      primaryDoctorId: v.primaryDoctorId,
      referredBy: v.referredBy || null,
      referralHospitalId: v.referralHospitalId || null,

      // Insurance (NOTE: server spelling is "Inssurance" — kept consistent)
      inssuranceProvider:       this.nullIfBlank(v.insuranceProvider),
      inssurancePolicyNumber:   this.nullIfBlank(v.insurancePolicyNumber),
      inssuranceExpiryDate:     v.insuranceExpiryDate || null,
      inssuranceCoverageAmount: v.insuranceCoverageAmount ?? null,

      // Medical narratives
      medicalHistory:     this.nullIfBlank(v.medicalHistory),
      familyHistory:      this.nullIfBlank(v.familyHistory),
      surgicalHistory:    this.nullIfBlank(v.surgicalHistory),
      allergyInformation: this.nullIfBlank(v.allergyInformation),
      currentMedications: this.nullIfBlank(v.currentMedications),
      lifestyleNotes:     this.nullIfBlank(v.lifestyleNotes),

      // Demographics
      occupation:        this.nullIfBlank(v.occupation),
      annualIncomeRange: this.nullIfBlank(v.annualIncomeRange),

      // Preferences
      preferredHospitalId:      v.preferredHospitalId || null,
      preferredDoctorId:        v.preferredDoctorId   || null,
      preferredAppointmentTime: this.nullIfBlank(v.preferredAppointmentTime),
      communicationPreferences: this.nullIfBlank(v.communicationPreferences),
    } as unknown as CreatePatientRequest);
  }

  private nullIfBlank(s: string | null | undefined): string | null {
    return s && s.trim() ? s : null;
  }

  resetForm(): void {
    if (!confirm('Discard all entered information?')) return;
    this.form.reset({
      firstName: '', lastName: '', dateOfBirth: null,
      gender: '', bloodGroup: '', maritalStatus: '',
      email: '', phone: '',
      emergencyContactName: '', emergencyContactPhone: '',
      address: '', city: '', postalCode: '',
      allergyInformation: '', medicalHistory: '', familyHistory: '',
      surgicalHistory: '', currentMedications: '', lifestyleNotes: '',
      primaryDoctorId: null, referredBy: null, referralHospitalId: null,
      insuranceProvider: '', insurancePolicyNumber: '',
      insuranceExpiryDate: null, insuranceCoverageAmount: null,
      occupation: '', annualIncomeRange: '',
      preferredHospitalId: null, preferredDoctorId: null,
      preferredAppointmentTime: '', communicationPreferences: '',
      agreeToTerms: false,
    });
    this.currentStepIdx.set(0);
    this.registeredPatientId.set(null);
  }

  registerAnother(): void {
    this.resetForm();
  }

  goToPatient(): void {
    const id = this.registeredPatientId();
    if (id) this.router.navigate(['/admin/crm/patient', id]);
  }

  printIntakeForm(): void {
    const id = this.registeredPatientId();
    if (id) {
      const v = this.form.getRawValue();
      this.printSrv.print('clinical.intake.standard', {
        patient: {
          id,
          name: this.fullName(),
          age: this.ageFromDob(),
          gender: v.gender,
          bloodType: v.bloodGroup,
          phone: v.phone,
          address: v.address
        },
        contact: {
          email: v.email,
          emergencyName: v.emergencyContactName,
          emergencyPhone: v.emergencyContactPhone
        },
        medical: {
          allergies: v.allergies,
          history: v.medicalHistory,
          medications: v.currentMedications
        },
        insurance: {
          provider: v.insuranceProvider,
          policyNumber: v.policyNumber
        },
        documentNumber: id,
        date: new Date().toLocaleDateString()
      }).catch(() => this.toastSrv.error('Printing failed — template may not exist yet'));
    }
  }
  // #endregion

  // #region Helpers for template
  ctrl(name: string): AbstractControl | null {
    return this.form.get(name);
  }
  // #endregion
}
