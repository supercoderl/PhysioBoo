import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";
import { PreferredCommunication } from "../../../../../shared/enums/preferred-communication";

@Component({
    selector: 'admin-account-contact',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        BooSelectComponent
    ],
    template: `
        <div class="flex flex-col gap-4">
            <div class="w-full">
              <p class="font-semibold text-base m-0">Contact & ID</p>
              <p class="m-0 text-[13px] leading-[1.5] text-[#4B5563]">
                Contact Information
              </p>
            </div>
            <div class="grid w-full gap-4 sm:grid-cols-4 border-b border-dashed pb-5">
                <div class="sm:col-span-2">
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Email
                    </label>
                    <boo-input
                        [label]="'john@example.com'"
                        formControlName="email"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div class="sm:col-span-2">
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Phone Number
                    </label>
                    <boo-input
                        [label]="'+18937573956'"
                        formControlName="phoneNumber"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div class="sm:col-span-2">
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Alternate Phone
                    </label>
                    <boo-input
                        [label]="'+18895478367'"
                        formControlName="alternatePhone"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div class="sm:col-span-2">
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Preferred Communication
                    </label>
                    <boo-select
                        [label]="'Select...'"
                        formControlName="preferredCommunication"
                        [required]="true"
                        booError
                        size="small"
                        [options]="preferredCommunicationOptions"
                    ></boo-select>
                </div>
            </div>
            
            <div class="w-full">
              <p class="m-0 text-[13px] leading-[1.5] text-[#4B5563]">
                Identification Documents
              </p>
            </div>
            <div class="grid w-full gap-4 sm:grid-cols-3">
                <div>
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Identification Type
                    </label>
                    <boo-input
                        [label]="'e.g. ID Card'"
                        formControlName="identificationType"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div>
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Identification Number
                    </label>
                    <boo-input
                        [label]="'e.g. 123456789'"
                        formControlName="identificationNumber"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div>
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Identification Expiry
                    </label>
                    <boo-input
                        [label]="'e.g. 18/01/2028'"
                        formControlName="identificationExpiry"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
            </div>
        </div>
    `
})

export class AdminAccountContactComponent {
    // #region Inputs, Outputs, Properties
    preferredCommunicationOptions = Object.keys(PreferredCommunication)
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            label: key,
            value: PreferredCommunication[key as keyof typeof PreferredCommunication]
        }));
    // #endregion
}