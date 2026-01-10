import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";

@Component({
    selector: 'admin-account-doctor-professional',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Primary Specialty Id
                </label>
                <boo-input
                    [label]="'Cardiology / Internal Medicine'"
                    formControlName="primarySpecialtyId"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Medical License Number
                </label>
                <boo-input
                    [label]="'Lic. No: 001234/BYT-CCHN'"
                    formControlName="medicalLicenseNumber"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Medical License Expiry
                </label>
                <boo-input
                    [label]="'31/12/2030'"
                    formControlName="medicalLicenseExpiry"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Issuing Authority
                </label>
                <boo-input
                    [label]="'Ministry of Health / Dept of Health HCMC'"
                    formControlName="issuingAuthority"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Years of Experience
                </label>
                <boo-input
                    [label]="'10'"
                    formControlName="yearsOfExperience"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Years of Practice
                </label>
                <boo-input
                    [label]="'8'"
                    formControlName="yearsOfPractice"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Archivements
                </label>
                <boo-input
                    [label]="'Labor Medal 3rd Class; Distinguished Doctor 2024...'"
                    formControlName="archivements"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Research Interests
                </label>
                <boo-input
                    [label]="'AI application in diagnostic imaging...'"
                    formControlName="researchInterests"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Publications Count
                </label>
                <boo-input
                    [label]="'15'"
                    formControlName="publicationsCount"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Conference Presentations
                </label>
                <boo-input
                    [label]="'5'"
                    formControlName="conferencePresentations"
                    booError
                    size="small"
                ></boo-input>
            </div>
        </div>
    `
})

export class AdminAccountDoctorProfessionalComponent {}