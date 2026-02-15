import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'mobile-app-home',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <section class="relative bg-surface block">
            <div class="container mx-auto px-3">
                <div id="app-bg" class="rounded-7.5 p-7.5 md:pt-12.5 md:px-12.5 z-[1] bg-[right_top] relative">
                    <div class="flex items-center">
                        <div class="px-3 flex text-center md:text-left">
                            <div class="flex flex-col justify-center p-0 md:pl-25 md:pt-10 md:pb-20 flex-col">
                                <div class="mb-6">
                                    <h3 class="mb-2.5 text-white text-[30px] md:text-[38px] font-bold text-balance">
                                        Download the Doccure App today!
                                    </h3>
                                    <p class="m-0 text-[#e2edff] text-balance">
                                        To download an app related to a doctor or medical services, you
                                        can typically visit the app store on your device.
                                    </p>
                                </div>
                                <div
                                    class=""
                                >
                                    <a href="/react/template/index" class="mr-3 text-neutral transition-smooth inline-block">
                                        <img
                                            alt="img"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/icons/app-store-01.svg" 
                                        />
                                    </a>
                                    <a href="/react/template/index" class=" text-neutral transition-smooth inline-block">
                                        <img
                                            alt="img"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/icons/google-play-01.svg"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            class="px-3 hidden md:block"
                        >
                            <div class="text-right relative bottom-0">
                                <img
                                    class="img-fluid"
                                    alt="img"
                                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/mobile-img.png"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="app-bgs">
                        <img
                            class="absolute left-6.25 bottom-0 z-[-1]"
                            alt="img"
                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/app-bg-02.png"
                        /><img
                            class="absolute top-[10%] left-0 z-[-1]"
                            alt="img"
                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/app-bg-03.png"
                        /><img
                            class="absolute bottom-5 right-0 z-[-1]"
                            alt="img"
                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/app-bg-04.png"
                        />
                    </div>
                </div>
            </div>
            <div class="absolute top-5 left-0">
                <img alt="img" src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/bg/download-bg.png" />
            </div>
        </section>
    `,
    styles: `
        #app-bg {
            background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%) no-repeat;
        }
    `
})

export class MobileAppHomeComponent {

}