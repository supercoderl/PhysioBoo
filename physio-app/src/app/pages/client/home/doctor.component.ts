import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { ChevronLeft, ChevronRight, Circle, Heart, MapPin, Star } from "lucide-angular";

@Component({
    selector: 'doctor-home',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
        <section class="bg-[#f9fbff] py-15 block">
            <div class="container mx-auto">
                <div
                    class="mb-10 text-center"
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <span class="inline-block text-xs14 rounded-5 font-medium py-1.75 px-5 relative mb-3.75 text-white bg-secondary">Featured Doctors</span>
                    <h2 class="text-2.5xl font-bold m-0 text-primary block">Our Highlighted Doctors</h2>
                </div>
                <div
                    class=""
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <div class="relative block" dir="ltr">
                        <div class="mb-4 text-center">
                            <button 
                                type="button" 
                                class="group left-[47%] w-9 h-9 bg-info2 border border-solid border-info2 rounded-full text-primary absolute bottom-[-60px] z-[99] cursor-pointer transition-smooth flex-center-center hover:bg-blue-500"
                                  (click)="slickModal.slickPrev()"
                            >
                                <lucide-angular [img]="ChevronLeft" class="font-black group-hover:stroke-white" />
                            </button>
                        </div>
                        <div class="-mr-6 relative block overflow-hidden">
                            <ngx-slick-carousel class="carousel" 
                                #slickModal="slick-carousel" 
                                [config]="slideConfig" 
                                (init)="slickInit($event)"
                                (breakpoint)="breakpoint($event)"
                                (afterChange)="afterChange($event)"
                                (beforeChange)="beforeChange($event)"
                            >
                                @for (slide of slides; track slide.img) {
                                    <div ngxSlickItem class="mr-6">
                                        <div
                                            class="w-full inline-block border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-2.5 relative"
                                        >
                                            <div class="transition-smooth overflow-hidden rounded-t-2.5 rounded-r-2.5 w-full">
                                                <a
                                                    href="https://doccure.dreamstechnologies.com/react/template/patient/doctor-profile"
                                                    class="group text-neutral transition-smooth"
                                                >
                                                    <img
                                                        alt=""
                                                        src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/doctor-grid/doctor-grid-02.jpg"
                                                        class="transition-smooth rounded-t-2.5 rounded-r-2.5 w-full block group-hover:scale-110"
                                                    />
                                                </a>
                                                <div
                                                    class="absolute top-5 left-0 right-0 px-5 items-center justify-between flex"
                                                >
                                                    <span class="bg-danger py-1 px-[0.45rem] font-semibold rounded-[4px] bg-danger text-white text-center flex items-center">
                                                        <lucide-angular [img]="Star" class="mr-1 w-3.75 fill-white" />4.6
                                                    </span>
                                                    <a
                                                        class="w-8 h-8 bg-white flex-center-center rounded-full text-neutral cursor-pointer transition-smooth"
                                                        href="https://doccure.dreamstechnologies.com/react/template/index"
                                                    >
                                                        <lucide-angular [img]="Heart" class="w-5 text-[#e3e6ec] fill-[#e3e6ec]" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    class="flex-center-between relative p-4 after:bg-[#110efd] after:content-[''] after:w-[2px] after:h-7.5 after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2"
                                                >
                                                    <a
                                                        class="text-[#3538cd] text-[0.875rem] font-medium transition-smooth"
                                                        href="https://doccure.dreamstechnologies.com/react/template/index"
                                                    >
                                                        Pediatrician
                                                    </a>
                                                    <span
                                                        class="bg-[#edf9f0] text-[#04bd6c] py-[0.25rem] px-[0.45rem] font-semibold rounded-[4px] inline-flex items-center"
                                                    >
                                                        <lucide-angular [img]="Circle" class="mr-1 w-1.5 fill-[#04bd6c]" />
                                                        Available
                                                    </span>
                                                </div>
                                                <div class="p-4 pt-0">
                                                    <div class="border-b border-dashed border-borderGray pb-4 mb-4">
                                                        <h3 class="mb-1 text-[20px] font-semibold text-primary">
                                                            <a
                                                                href="https://doccure.dreamstechnologies.com/react/template/patient/doctor-profile"
                                                                class="text-neutral transition-smooth"
                                                            >
                                                                Dr. Nicholas Tello
                                                            </a>
                                                        </h3>
                                                        <div class="flex items-center">
                                                            <p class="flex items-center mb-0 text-[0.875rem] text-brandDark">
                                                                <lucide-angular [img]="MapPin" class="mr-2 w-[14px]" />Ogden, IA
                                                            </p>
                                                            <lucide-angular [img]="Circle" class="ml-2 mr-1 fill-secondary w-1.5 table" />
                                                            <span class="text-[0.875rem] font-medium">60 Min</span>
                                                        </div>
                                                    </div>
                                                    <div
                                                        class="flex-center-between"
                                                    >
                                                        <div>
                                                            <p class="mb-1 text-[0.875rem] text-brandDark">Consultation Fees</p>
                                                            <h3 class="text-danger text-[20px] font-semibold">$400</h3>
                                                        </div>
                                                        <a
                                                            class="bg-primary border border-solid border-primary text-white py-[0.35rem] px-3.4 text-[0.813rem] transition-smooth font-medium rounded-full inline-flex items-center truncate cursor-pointer"
                                                            href="https://doccure.dreamstechnologies.com/react/template/booking"
                                                        >
                                                            Book Now
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </ngx-slick-carousel>
                        </div>
                        <div class="mt-4 text-center">
                            <button 
                                type="button" 
                                class="group left-1/2 ml-3 w-9 h-9 bg-info2 border border-solid border-info2 rounded-full text-primary m-0 absolute bottom-[-60px] z-[99] cursor-pointer transition-smooth flex-center-center hover:bg-blue-500"
                                (click)="slickModal.slickNext()"
                            >
                                <lucide-angular [img]="ChevronRight" class="font-black group-hover:stroke-white" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="mt-4 text-center"></div>
            </div>
            </section>
    `
})

export class DoctorHomeComponent {
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;
    readonly Star = Star;
    readonly Heart = Heart;
    readonly Circle = Circle;
    readonly MapPin = MapPin;

    slides = [
        { img: "http://placehold.it/350x150/000000" },
        { img: "http://placehold.it/350x150/111111" },
        { img: "http://placehold.it/350x150/333333" },
        { img: "http://placehold.it/350x150/000000" },
        { img: "http://placehold.it/350x150/111111" },
        { img: "http://placehold.it/350x150/333333" },
        { img: "http://placehold.it/350x150/000000" },
        { img: "http://placehold.it/350x150/111111" },
        { img: "http://placehold.it/350x150/333333" },
        { img: "http://placehold.it/350x150/666666" }
    ];
    slideConfig = { 
        slidesToShow: 4, 
        slidesToScroll: 1,
        touchThreshold: 20,
        swipeToSlide: true
    };

    addSlide() {
        this.slides.push({ img: "http://placehold.it/350x150/777777" })
    }

    removeSlide() {
        this.slides.length = this.slides.length - 1;
    }

    slickInit(e: any) {
        console.log('slick initialized');
    }

    breakpoint(e: any) {
        console.log('breakpoint');
    }

    afterChange(e: any) {
        console.log('afterChange');
    }

    beforeChange(e: any) {
        console.log('beforeChange');
    }
}
