import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'why-choose-about-us',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <section class="bg-white pb-9 block">
        <div class="container mx-auto">
            <div class="flex justify-center">
                <div class="px-3">
                    <div class="mb-10 text-center">
                        <h2 class="text-[32px] mb-0 font-bold text-primary leading-[1.2]">Why Choose Us</h2>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-4">
                <div class="flex px-3">
                    <div class="rounded-[8px] transition-smooth border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 w-full relative flex">
                        <div class="p-6.25 flex-1">
                            <div class="pb-5">
                                <span class="w-20 h-20 rounded-full text-white bg-secondary flex-center-center">
                                    <img
                                        alt=""
                                        src="https://doccure.dreamstechnologies.com/react/template/assets/choose-01-CEk598Os.svg"
                                    />
                                </span>
                            </div>
                            <div>
                                <h4 class="text-[20px] font-semibold mb-3 text-primary leading-[1.2]">Qualified Staff of Doctors</h4>
                                <p class="text-base mb-0 text-primary">
                                    Lorem ipsum sit amet consectetur incididunt ut labore et
                                    exercitation ullamco laboris nisi dolore magna enim veniam
                                    aliqua.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex px-3">
                    <div class="rounded-[8px] transition-smooth border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 w-full relative flex">
                        <div class="p-6.25 flex-1">
                            <div class="pb-5">
                                <span class="w-20 h-20 rounded-full text-white bg-secondary flex-center-center">
                                    <img
                                        alt=""
                                        src="https://doccure.dreamstechnologies.com/react/template/assets/choose-02-DJsQof_3.svg"
                                    />
                                </span>
                            </div>
                            <div>
                                <h4 class="text-[20px] font-semibold mb-3 text-primary leading-[1.2]">Qualified Staff of Doctors</h4>
                                <p class="text-base mb-0 text-primary">
                                    Lorem ipsum sit amet consectetur incididunt ut labore et
                                    exercitation ullamco laboris nisi dolore magna enim veniam
                                    aliqua.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex px-3">
                    <div class="rounded-[8px] transition-smooth border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 w-full relative flex">
                        <div class="p-6.25 flex-1">
                            <div class="pb-5">
                                <span class="w-20 h-20 rounded-full text-white bg-secondary flex-center-center">
                                    <img
                                        alt=""
                                        src="https://doccure.dreamstechnologies.com/react/template/assets/choose-03-CMhCibPg.svg"
                                    />
                                </span>
                            </div>
                            <div>
                                <h4 class="text-[20px] font-semibold mb-3 text-primary leading-[1.2]">Qualified Staff of Doctors</h4>
                                <p class="text-base mb-0 text-primary">
                                    Lorem ipsum sit amet consectetur incididunt ut labore et
                                    exercitation ullamco laboris nisi dolore magna enim veniam
                                    aliqua.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex px-3">
                    <div class="rounded-[8px] transition-smooth border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 w-full relative flex">
                        <div class="p-6.25 flex-1">
                            <div class="pb-5">
                                <span class="w-20 h-20 rounded-full text-white bg-secondary flex-center-center">
                                    <img
                                        alt=""
                                        src="https://doccure.dreamstechnologies.com/react/template/assets/choose-04-DVFujUZz.svg"
                                    />
                                </span>
                            </div>
                            <div>
                                <h4 class="text-[20px] font-semibold mb-3 text-primary leading-[1.2]">Qualified Staff of Doctors</h4>
                                <p class="text-base mb-0 text-primary">
                                    Lorem ipsum sit amet consectetur incididunt ut labore et
                                    exercitation ullamco laboris nisi dolore magna enim veniam
                                    aliqua.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `
})

export class WhyChooseAboutUsComponent {}