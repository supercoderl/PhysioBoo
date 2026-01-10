import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";

@Component({
    selector: 'admin-account-patient-preference',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Primary Doctor
                </label>
                <boo-input
                    [label]="'Select Doctor...'"
                    formControlName="primaryDoctorId"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Preferred Doctor
                </label>
                <boo-input
                    [label]="'Select Doctor...'"
                    formControlName="preferredDoctorId"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Preferred Hospital
                </label>
                <boo-input
                    [label]="'Select Branch/Location...'"
                    formControlName="preferredHospitalId"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Preferred Appointment Time
                </label>
                <boo-input
                    [label]="'Morning (8-10 AM) / Weekends Only'"
                    formControlName="preferredAppointmentTime"
                    booError
                    size="small"
                ></boo-input>
            </div>  
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Communication Preferrences
                </label>
                <boo-input
                    [label]="'Email, SMS, Zalo'"
                    formControlName="communicationPreferrences"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
        </div>
    `
})

export class AdminAccountPatientPreferenceComponent { }