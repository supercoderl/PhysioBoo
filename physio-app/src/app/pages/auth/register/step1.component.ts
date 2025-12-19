import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BooButtonComponent } from "../../../components/button/boo-button/boo-button.component";
import { BooInputComponent } from "../../../components/input/boo-input/boo-input.component";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'register-step-one',
    standalone: true,
    imports: [
    SharedModule,
    BooButtonComponent,
    BooInputComponent
],
    template: `
        <div class="min-w-full px-1 pb-2 h-full flex" id="step1" [formGroup]="formGroup">
            <div class="relative flex flex-1 flex-col">
                <h3
                    class="text-[24px] text-black font-semibold"
                >
                    Create your account
                </h3>
                <div class="relative flex flex-1 flex-col">
                    <div class="space-y-3">
                        <div>
                            <label
                                class="text-xs14 font-medium text-primary mb-1 inline-block"
                            >
                                Email
                            </label>
                            <boo-input
                                label="Enter your email"
                                formControlName="email"
                                booError
                            />
                        </div>
                        <div>
                            <label
                                class="text-xs14 font-medium text-primary mb-1 inline-block"
                            >
                                Phone number
                            </label>
                            <boo-input
                                label="Enter your phone number"
                                formControlName="phone"
                                booError
                            />
                        </div>
                        <div>
                            <label
                                class="text-xs14 font-medium text-primary mb-1 inline-block"
                            >
                                Password
                            </label>
                            <boo-input
                                label="Enter your password"
                                formControlName="password"
                                booError
                            />
                        </div>
                    </div>

                    <div class="mt-auto">
                        <div class="flex justify-between gap-5">
                            <button
                                boo-button
                                label="Next"
                                [radius]="5"
                                (click)="onNext.emit()"
                                class="w-full"
                                classname="w-full !py-3 uppercase text-md font-bold"
                            ></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class RegisterStepOneComponent {
    // #region Inputs, Outputs, Properties
    @Output() onNext = new EventEmitter<MouseEvent>();
    @Input() formGroup!: FormGroup;
    // #endregion

    // #region Init (Lifecycle + Setup)

    // #endregion
}