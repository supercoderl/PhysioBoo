import { Component } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";

@Component({
    selector: 'admin-account-emergency',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
    ],
    template: `
        <div class="flex flex-col gap-4">
            <div class="w-full">
                <p class="font-semibold text-base m-0">Emergency Contact</p>
                <p class="m-0 text-[13px] leading-[1.5] text-[#4B5563]">
                    Trusted contacts we can reach out to in urgent situations.
                </p>
            </div>
            <div class="grid w-full gap-4 sm:grid-cols-3">
                <div>
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Emergency Contact Name
                    </label>
                    <boo-input
                        [label]="'e.g. Dr John'"
                        formControlName="emergencyContactName"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div>
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Emergency Contact Phone
                    </label>
                    <boo-input
                        [label]="'+189581985717'"
                        formControlName="emergencyContactPhone"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
                <div>
                    <label
                        class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                        Emergency Contact Relationship
                    </label>
                    <boo-input
                        [label]="'e.g. Mother, Friend'"
                        formControlName="emergencyContactRelationship"
                        [required]="true"
                        booError
                        size="small"
                    ></boo-input>
                </div>
            </div>
        </div>
    `
})

export class AdminAccountEmergencyComponent { }