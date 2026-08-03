import { Component, inject, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { BloodGroup } from "../../../../../shared/enums/blood-group";
import { Gender } from "../../../../../shared/enums/gender";
import { MaritalStatus } from "../../../../../shared/enums/marital-status";
import { SharedModule } from "../../../../../shared/shared-imports";
import { UserProfileBase } from "../../../../../shared/types/core.types";
import { BooDatepickerComponent } from "../../../../date-picker/boo-date-picker.component";
import { BooInputComponent } from "../../../../input/boo-input/boo-input.component";
import { BooSelectComponent } from "../../../../select/boo-select/boo-select.component";

@Component({
  selector: 'admin-account-profile',
  standalone: true,
  imports: [
    SharedModule,
    BooInputComponent,
    BooDatepickerComponent,
    BooSelectComponent
  ],
  template: `
        <div class="flex flex-col gap-4">
            <div class="w-full">
              <p class="font-semibold text-base m-0">Profile</p>
              <p class="m-0 text-[13px] leading-[1.5] text-[#4B5563]">
                Manage your name, date of birth, and other personal identity details.
              </p>
            </div>
            <div class="grid w-full gap-4 sm:grid-cols-4">
              <div class="sm:col-span-1">
                <div
                  class="border-4 border-solid w-40 h-40 overflow-hidden relative flex-center-center leading-none rounded-full overflow-hidden text-[13px] border-[#c3c3c3] bg-surface"
                >
                  <img
                    alt="User avatar"
                    class="w-full h-full text-center object-cover"
                    [appSrc]="userInfo?.avatarUrl"
                  />
                </div>
              </div>
              <div class="sm:col-span-3 grid grid-cols-3 gap-4">
                <div>
                  <div
                    class="w-full inline-flex flex-col relative min-w-0 p-0 m-0 border-0"
                  >
                    <label
                      class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                      First Name
                    </label>
                    <boo-input
                      [label]="'e.g. John'"
                      formControlName="firstName"
                      [required]="true"
                      booError
                      size="small"
                    ></boo-input>
                  </div>
                </div>
                <div>
                  <div
                    class="w-full inline-flex flex-col relative min-w-0 p-0 m-0 border-0"
                  >
                    <label
                      class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                      Middle Name
                    </label>
                    <boo-input
                      [label]="'e.g. Harry'"
                      formControlName="middleName"
                      [required]="true"
                      booError
                      size="small"
                    ></boo-input>
                  </div>
                </div>
                <div>
                  <div
                    class="w-full inline-flex flex-col relative min-w-0 p-0 m-0 border-0"
                  >
                    <label
                      class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                      Last Name
                    </label>
                    <boo-input
                      [label]="'e.g. Alexander'"
                      formControlName="lastName"
                      [required]="true"
                      booError
                      size="small"
                    ></boo-input>
                  </div>
                </div>
                <div>
                  <div
                    class="w-full inline-flex flex-col relative min-w-0 p-0 m-0 border-0"
                  >
                    <label
                      class="text-xs font-medium text-primary mb-1 inline-block"
                    >
                      Date of Birth
                    </label>
                    <boo-datepicker
                      [label]="'DD/MM/YYYY'"
                      formControlName="dateOfBirth"
                      [required]="true"
                      booError
                      size="small"
                    ></boo-datepicker>
                  </div>
                </div>
                <div>
                  <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                  >
                    Gender
                  </label>
                  <boo-select
                    [label]="'Select...'"
                    formControlName="gender"
                    [required]="true"
                    booError
                    size="small"
                    [options]="genderOptions"
                  ></boo-select>
                </div>
                <div>
                  <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                  >
                    Marital Status
                  </label>
                  <boo-select
                    [label]="'Select...'"
                    formControlName="maritalStatus"
                    [required]="true"
                    booError
                    size="small"
                    [options]="maritalStatusOptions"
                  ></boo-select>
                </div>
                <div>
                  <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                  >
                    Nationality
                  </label>
                  <boo-input
                    [label]="'e.g. USA'"
                    formControlName="nationality"
                    [required]="true"
                    booError
                    size="small"
                  ></boo-input>
                </div>
                <div>
                  <label
                    class="text-xs font-medium text-primary mb-1 inline-block"
                  >
                    Blood Group
                  </label>
                  <boo-select
                    [label]="'Select...'"
                    formControlName="bloodGroup"
                    [required]="true"
                    booError
                    size="small"
                    [options]="bloodGroupOptions"
                  ></boo-select>
                </div>
              </div>
            </div>
        </div>
    `
})

export class AdminAccountProfileComponent implements OnInit {
  // #region Inject Methods
  router = inject(Router);
  // #endregion

  // #region Inputs, Outputs, Properties
  @Input() userInfo?: UserProfileBase | null;
  genderOptions = Object.keys(Gender)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: Gender[key as keyof typeof Gender]
    }));

  maritalStatusOptions = Object.keys(MaritalStatus)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: MaritalStatus[key as keyof typeof MaritalStatus]
    }));

  bloodGroupOptions = Object.keys(BloodGroup)
    .filter(key => isNaN(Number(key)))
    .map(key => ({
      label: key,
      value: BloodGroup[key as keyof typeof BloodGroup]
    }));
  // #endregion

  // #region Init(Life cycle + Setup)
  ngOnInit(): void {
    if(!this.userInfo) this.router.createUrlTree(['/exception/401']);
  }
  // #endregion
}