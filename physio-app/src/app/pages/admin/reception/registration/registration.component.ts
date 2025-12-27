import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AdminContentHeaderComponent } from "../../../../components/layout/admin/content-header/content-header.component";
import { BooInputComponent } from "../../../../components/input/boo-input/boo-input.component";
import { BooDatepickerComponent } from "../../../../components/date-picker/boo-date-picker.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";

@Component({
    selector: 'admin-registration',
    standalone: true,
    imports: [
    SharedModule,
    AdminContentHeaderComponent,
    BooInputComponent,
    BooDatepickerComponent,
    BooSelectComponent
],
    templateUrl: './registration.component.html'
})

export class AdminRegistrationComponent {
    // #region Inputs, Outputs, Properties
    registrationForm: FormGroup;
    showSuccessMessage = false;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(private fb: FormBuilder) {
        this.registrationForm = this.fb.group({
            // Personal Information
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            dateOfBirth: ['', Validators.required],
            gender: ['', Validators.required],
            bloodGroup: [''],
            maritalStatus: [''],

            // Contact Information
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            emergencyContactName: ['', Validators.required],
            emergencyContactPhone: ['', Validators.required],
            address: ['', Validators.required],
            city: ['', Validators.required],
            postalCode: ['', Validators.required],

            // Medical Information
            allergies: [''],
            medicalHistory: [''],
            currentMedications: [''],

            // Insurance Information
            insuranceProvider: [''],
            policyNumber: [''],

            // Terms
            agreeToTerms: [false, Validators.requiredTrue]
        });
    }
    // #endregion

    // #region Methods
    isFieldInvalid(fieldName: string): boolean {
        const field = this.registrationForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit() {
        if (this.registrationForm.valid) {
            console.log('Form Data:', this.registrationForm.value);
            this.showSuccessMessage = true;

            // Here you would typically send the data to your backend API
            // Example:
            // this.patientService.registerPatient(this.registrationForm.value).subscribe(...)

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Hide success message after 5 seconds
            setTimeout(() => {
                this.showSuccessMessage = false;
            }, 5000);
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.registrationForm.controls).forEach(key => {
                this.registrationForm.get(key)?.markAsTouched();
            });
        }
    }

    resetForm() {
        this.registrationForm.reset();
        this.showSuccessMessage = false;
    }
    // #endregion
}