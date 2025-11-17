import { Component, EventEmitter, Output } from "@angular/core";
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
        <div class="min-w-full" id="step1">
            <div class="relative">
                <h3
                    class="text-[24px] text-black font-semibold"
                >
                    Create your account
                </h3>
                <div class="relative">
                    <div class="space-y-3">
                        <div>
                            <label
                                class="text-xs14 font-medium text-primary mb-1 inline-block"
                            >
                                Email
                            </label>
                            <boo-input
                                label="Enter your email"
                                id="email"
                                name="email"
                                [radius]="5"
                                backgroundColor="white"
                                [borderWidth]="1"
                                borderColor="#e6e8ee"
                                size="small"
                                placeholderColor="rgba(0, 0, 0, 0.4)"
                                required
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
                                id="phone"
                                name="phone"
                                [radius]="5"
                                backgroundColor="white"
                                [borderWidth]="1"
                                borderColor="#e6e8ee"
                                size="small"
                                placeholderColor="rgba(0, 0, 0, 0.4)"
                                required
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
                                id="password"
                                name="password"
                                [radius]="5"
                                backgroundColor="white"
                                [borderWidth]="1"
                                borderColor="#e6e8ee"
                                size="small"
                                placeholderColor="rgba(0, 0, 0, 0.4)"
                                required
                            />
                        </div>
                    </div>
                    <div class="mt-10">
                        <div class="flex justify-between gap-5">
                            <boo-button
                                label="Next"
                                [radius]="5"
                                (clicked)="onNext.emit()"
                            ></boo-button>
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
    // #endregion
}