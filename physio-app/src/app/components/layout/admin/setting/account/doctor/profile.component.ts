import { Component } from "@angular/core";
import { SharedModule } from "../../../../../../shared/shared-imports";
import { BooInputComponent } from "../../../../../input/boo-input/boo-input.component";
import { BooTextareaComponent } from "../../../../../textarea/boo-textarea/boo-textarea.component";
import { BooSelectComponent } from "../../../../../select/boo-select/boo-select.component";
import { SwitchComponent } from "../../../../../switch/switch.component";

@Component({
    selector: 'admin-account-doctor-profile',
    standalone: true,
    imports: [
        SharedModule,
        BooInputComponent,
        BooTextareaComponent,
        BooSelectComponent,
        SwitchComponent
    ],
    template: `
        <div class="grid w-full gap-4 sm:grid-cols-3">
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Bio
                </label>
                <boo-input
                    [label]="'Specialist Level II Doctor with over 15 years of experience in Cardiology...'"
                    formControlName="bio"
                    [required]="true"
                    booError
                    size="small"
                ></boo-input>
            </div>
            <div class="sm:col-span-3">
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    About
                </label>
                <boo-textarea
                    [label]="'Graduated from University of Medicine & Pharmacy in 2010, formerly trained in France...'"
                    formControlName="bio"
                    [required]="true"
                    booError
                    size="small"
                    [rows]="8"
                ></boo-textarea>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Languages Spoken
                </label>
                <boo-select
                    [label]="'Select...'"
                    formControlName="bio"
                    booError
                    size="small"
                ></boo-select>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Available Online
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Available Home Visit
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Available Emergency
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Feature
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
            <div>
                <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                >
                    Verified
                </label>
                <div>
                    <switch [isOpen]="true" />
                </div>
            </div>
        </div>
    `
})

export class AdminAccountDoctorProfileComponent {}