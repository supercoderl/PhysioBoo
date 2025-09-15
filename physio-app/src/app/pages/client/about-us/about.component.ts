import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'about-about-us',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <section class="bg-white py-15 block">
        <div class="container mx-auto">
            <div class="grid grid-cols-2 items-center">
                <div class="px-3">
                    <div class="pr-7.5">
                        <div class="grid grid-cols-2">
                            <div class="px-3">
                                <div>
                                    <div class="rounded-[8px] mb-6.25">
                                        <img
                                            class="rounded-[8px]"
                                            alt=""
                                            src="https://doccure.dreamstechnologies.com/react/template/assets/about-img1-a_opMl1I.jpg"
                                        />
                                    </div>
                                    <div class="rounded-[8px] mb-6.25">
                                        <img
                                            class="rounded-[8px]"
                                            alt=""
                                            src="https://doccure.dreamstechnologies.com/react/template/assets/about-img2-CBjb9fiE.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="px-3">
                                <div>
                                    <div class="bg-secondary rounded-[8px] mt-3.75 mb-6.25 py-11.25 px-2.5 text-center">
                                        <h4 class="font-semibold text-[20px] text-white max-w-52 mx-auto leading-[1.2]">Over 25+ Years Experience</h4>
                                    </div>
                                    <div class="rounded-[8px] mb-6.25">
                                        <img
                                            class="rounded-[8px]"
                                            alt=""
                                            src="https://doccure.dreamstechnologies.com/react/template/assets/about-img3-DdRvDWhr.jpg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="px-3">
                    <div class="mb-5">
                        <h6 class="font-semibold text-base text-secondary mb-0">About Our Company</h6>
                        <h2 class="text-[32px] mb-0 leading-[1.2]">We Are Always Ensure Best Medical Treatment For Your Health</h2>
                    </div>
                    <div>
                        <div class="pb-6.25">
                            <p class="text-base mb-4 text-brandDark">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                                reprehenderit in voluptate velit esse cillum dolore eu fugiat
                                nulla pariatur.
                            </p>
                            <p class="text-base mb-0 text-brandDark">
                                Sed ut perspiciatis unde omnis iste natus sit voluptatem
                                accusantium doloremque eaque ipsa quae architecto beatae vitae
                                dicta sunt explicabo.
                            </p>
                        </div>
                        <div class="flex items-center">
                            <div class="mr-4">
                                <span class="w-11.75 h-11.75 rounded-full text-white bg-secondary text-[24px] flex-center-center">
                                    <img
                                        alt=""
                                        src="data:image/svg+xml,%3csvg%20width='27'%20height='27'%20viewBox='0%200%2027%2027'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cpath%20d='M22.5%2012.3739H24.75C24.75%206.60262%2020.3929%202.25%2014.6138%202.25V4.5C19.1835%204.5%2022.5%207.81087%2022.5%2012.3739Z'%20fill='white'/%3e%3cpath%20d='M14.6248%208.99954C16.9907%208.99954%2017.9998%2010.0087%2017.9998%2012.3745H20.2498C20.2498%208.74641%2018.253%206.74954%2014.6248%206.74954V8.99954ZM18.4746%2015.1229C18.2584%2014.9264%2017.9743%2014.8216%2017.6824%2014.8307C17.3904%2014.8397%2017.1133%2014.9618%2016.9097%2015.1713L14.2176%2017.9399C13.5696%2017.8162%2012.2668%2017.41%2010.9258%2016.0724C9.58483%2014.7303%209.1787%2013.4242%209.05833%2012.7807L11.8247%2010.0874C12.0344%209.88393%2012.1567%209.60684%2012.1658%209.31477C12.1748%209.0227%2012.0698%208.73858%2011.8731%208.52254L7.7162%203.95166C7.51938%203.73494%207.24582%203.60348%206.95363%203.5852C6.66143%203.56693%206.37363%203.66328%206.15133%203.85379L3.71008%205.94741C3.51558%206.14262%203.39949%206.40242%203.38383%206.67754C3.36695%206.95879%203.0452%2013.621%208.2112%2018.7893C12.718%2023.2949%2018.3632%2023.6245%2019.918%2023.6245C20.1452%2023.6245%2020.2847%2023.6178%2020.3218%2023.6155C20.5969%2023.6001%2020.8566%2023.4835%2021.0508%2023.2882L23.1433%2020.8458C23.334%2020.6236%2023.4305%2020.3359%2023.4125%2020.0437C23.3944%2019.7515%2023.2631%2019.4779%2023.0466%2019.2809L18.4746%2015.1229Z'%20fill='white'/%3e%3c/svg%3e"
                                    />
                                </span>
                            </div>
                            <div>
                                <p class="text-base mb-1 text-brandDark font-medium">Need Emergency?</p>
                                <h4 class="text-[20px] mb-0 text-brandDark font-semibold leading-[1.2]">+1 315 369 5943</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `
})

export class AboutAboutUsComponent {}