import { Component } from "@angular/core";
import { ChevronLeft, ChevronRight } from "lucide-angular";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'speciality-home',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
    <section class="py-15 block">
        <div class="container mx-auto px-3">
            <div
                class="mb-10 text-center"
            >
                <span class="text-xs14 rounded-5 font-medium py-1.75 px-5 relative mb-3.75 text-white bg-secondary inline-block">Top Specialties</span>
                <h2 class="text-[24px] md:text-2.5xl font-bold">Highlighting the Care &amp; Support</h2>
            </div>
            <div>
                <div class="relative block">
                    <div class="text-center mt-10">
                        <button 
                            type="button" 
                            class="group left-[45%] md:left-[48%] -translate-x-1/2 flex-center-center w-9 h-9 bg-info2 border border-solid border-info2 rounded-full text-primary absolute bottom-[-60px] z-[99] cursor-pointer transition-smooth hover:bg-blue-500"
                            (click)="slickModal.slickPrev()"
                        >
                            <lucide-angular [img]="ChevronLeft" class="font-black group-hover:stroke-white" />
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
                                <div
                                    ngxSlickItem
                                    class="w-full inline-block transition-smooth text-center px-3"
                                >
                                    <div class="group relative mb-4 rounded-5 transition-smooth before:absolute before:top-0 before:left-0 before:content-[''] before:bg-[#0000004d] before:w-full before:h-full before:rounded-5 before:transition-all before:duration-400 hover:before:bg-[rgba(0,_0,_0,_0.6)]">
                                        <img
                                            class="rounded-5 block max-w-full w-full h-full object-cover"
                                            alt="img"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/specialities/speciality-02.jpg"
                                        />
                                        <span class="w-15 h-15 rounded-full bg-white inlineFlex-center-center absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
                                            <img
                                                class="w-auto h-auto rounded-5 block group-hover:animate-flip360"
                                                alt="img"
                                                src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/specialities/speciality-icon-02.svg"
                                            />
                                        </span>
                                    </div>
                                    <h6 class="text-base font-medium mb-1 text-primary">
                                        <a
                                            href="https://doccure.dreamstechnologies.com/react/template/patient/doctor-grid"
                                            class="text-neutral transition-smooth cursor-pointer"
                                        >
                                            Orthopedics
                                        </a>
                                    </h6>
                                    <p class="mb-0 text-xs14 text-brandDark">151 Doctors</p>
                                </div>
                            }
                        </ngx-slick-carousel>
                    </div>
                        <div class="text-center mt-10">
                            <button 
                                type="button" 
                                class="group left-[55%] md:left-[52%] -translate-x-1/2 flex-center-center ml-3 w-9 h-9 bg-info2 border border-solid border-info2 rounded-full text-primary absolute bottom-[-60px] z-[99] cursor-pointer transition-smooth hover:bg-blue-500"
                                (click)="slickModal.slickNext()"
                            >
                                <lucide-angular [img]="ChevronRight" class="font-black group-hover:stroke-white" />
                            </button>
                        </div>
                    </div>
                </div>
                <div class="text-center mt-10"></div>
            </div>
        </section>
    `,
    styles: [`
        ::ng-deep .specialty-carousel .slick-slide {
            padding: 0 12px;
        }
        
        ::ng-deep .specialty-carousel .slick-list {
            margin: 0 -12px;
        }
    `]
})

export class SpecialityHomeComponent {
    readonly ChevronLeft = ChevronLeft;
    readonly ChevronRight = ChevronRight;

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
        slidesToShow: 8,
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