import { Component } from "@angular/core";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'doctor-home',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
        <section class="bg-[#f9fbff] py-12.5 md:py-15 block">
            <div class="container mx-auto">
                <div
                    class="mb-10 text-center"
                >
                    <span class="inline-block text-xs14 rounded-5 font-medium py-1.75 px-5 relative mb-3.75 text-white bg-secondary">Featured Doctors</span>
                    <h2 class="text-[24px] text-2.5xl font-bold m-0 text-primary block">Our Highlighted Doctors</h2>
                </div>
                <div
                    class=""
                >
                    <div class="relative block" dir="ltr">
                        <div class="mb-4 text-center">
                            <button 
                                type="button" 
                                class="group left-[45%] md:left-[48%] -translate-x-1/2 w-9 h-9 bg-info2 border border-solid border-info2 rounded-full text-primary absolute bottom-[-60px] z-[99] cursor-pointer transition-smooth flex-center-center hover:bg-primary"
                                  (click)="slickModal.slickPrev()"
                            >
                                <physio-icon name="chevron-left" [size]="24" class="font-black group-hover:text-white" />
                            </button>
                        </div>
                        <div class="relative block overflow-hidden">
                            <ngx-slick-carousel class="carousel" 
                                #slickModal="slick-carousel" 
                                [config]="slideConfig" 
                                (init)="slickInit($event)"
                                (breakpoint)="breakpoint($event)"
                                (afterChange)="afterChange($event)"
                                (beforeChange)="beforeChange($event)"
                            >
                                @for (slide of slides; track slide.img) {
                                    <div ngxSlickItem class="px-3">
                                        <div
                                            class="w-full inline-block border border-solid border-borderGray shadow-[0_4px_14px_#FFE9EE40] mb-6 rounded-2.5 relative"
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
                                                        <physio-icon name="star" [size]="15" [class]="'mr-1 [&_svg]:fill-white'" />4.6
                                                    </span>
                                                    <a
                                                        class="w-8 h-8 bg-surface flex-center-center rounded-full text-neutral cursor-pointer transition-smooth"
                                                        href="https://doccure.dreamstechnologies.com/react/template/index"
                                                    >
                                                        <physio-icon name="heart" [size]="20" class="text-[#e3e6ec] [&_svg]:fill-[#e3e6ec]" />
                                                    </a>
                                                </div>
                                            </div>
                                            <div>
                                                <div
                                                    class="flex-center-between relative p-4 after:bg-[#E11D48] after:content-[''] after:w-[2px] after:h-7.5 after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2"
                                                >
                                                    <a
                                                        class="text-[#E11D48] text-[0.875rem] font-medium transition-smooth"
                                                        href="https://doccure.dreamstechnologies.com/react/template/index"
                                                    >
                                                        Pediatrician
                                                    </a>
                                                    <span
                                                        class="bg-[#edf9f0] text-[#04bd6c] py-[0.25rem] px-[0.45rem] font-semibold rounded-[4px] inline-flex items-center"
                                                    >
                                                        <physio-icon name="circle" [size]="6" [class]="'mr-1 [&_svg]:fill-[#04bd6c]'" />
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
                                                                <physio-icon name="map-pin" [size]="14" [class]="'mr-2'" />Ogden, IA
                                                            </p>
                                                            <physio-icon name="circle" [size]="6" [class]="'ml-2 mr-1 [&_svg]:fill-secondary table'" />
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
                                class="group left-[55%] md:left-[52%] -translate-x-1/2 ml-3 w-9 h-9 bg-info2 border border-solid border-info2 rounded-full text-primary m-0 absolute bottom-[-60px] z-[99] cursor-pointer transition-smooth flex-center-center hover:bg-primary"
                                (click)="slickModal.slickNext()"
                            >
                                <physio-icon name="chevron-right" [size]="24" class="font-black group-hover:text-white" />
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
        swipeToSlide: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 6
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 2
                }
            },
        ]
    };

    addSlide() {
        this.slides.push({ img: "http://placehold.it/350x150/777777" })
    }

    removeSlide() {
        this.slides.length = this.slides.length - 1;
    }

    slickInit(e: any) {
      
    }

    breakpoint(e: any) {
        
    }

    afterChange(e: any) {
        
    }

    beforeChange(e: any) {
        
    }
}
