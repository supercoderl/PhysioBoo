import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";

@Component({
    selector: 'admin-account-doctor-service',
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
                    Consultation Fee Min
                </label>
                <boo-input
                    [label]="'200,000'"
                    formControlName="consultationFeeMin"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Consultation Fee Max
                </label>
                <boo-input
                    [label]="'500,000'"
                    formControlName="consultationFeeMax"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Follow Up Fee
                </label>
                <boo-input
                    [label]="'150,000'"
                    formControlName="followUpFee"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Emergency Consultation Fee
                </label>
                <boo-input
                    [label]="'1,000,000'"
                    formControlName="emergencyConsultationFee"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Home Visit Fee
                </label>
                <boo-input
                    [label]="'2,000,000'"
                    formControlName="homeVisitFee"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Video Consultation Fee
                </label>
                <boo-input
                    [label]="'300,000'"
                    formControlName="videoConsultationFee"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Buffer Time
                </label>
                <boo-input
                    [label]="'5'"
                    formControlName="bufferTime"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Advanced Booking Days
                </label>
                <boo-input
                    [label]="'30'"
                    formControlName="advancedBookingDays"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Cancellation Policy
                </label>
                <boo-input
                    [label]="'100% refund if canceled 24h prior, no refund after...'"
                    formControlName="cancellationPolicy"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
        </div>
    `
})

export class AdminAccountDoctorServiceComponent {}