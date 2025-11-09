import { Component } from "@angular/core";
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
        <div class="tab-pane fade" id="step1">
            <div class="relative">
                <h3
                    class="text-[30px] text-black font-semibold mb-3.75"
                >
                    Create your account
                </h3>
                <p class="m-0 text-[#4B5563] text-base">
                    👋 Let’s start your dream journry
                </p>
                <div class="relative mt-5">
                    <div class="grid grid-cols-2">
                        <div>
                            <div class="mt-5 relative">
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
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="mt-5 relative">
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
                                    />
                                </div>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="mt-5 relative">
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
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-10">
                        <div class="flex justify-between gap-5">
                            <boo-button
                                label="Next"
                                [radius]="5"
                            ></boo-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class RegisterStepOneComponent {}