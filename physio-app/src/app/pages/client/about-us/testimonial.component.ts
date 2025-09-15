import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { ChevronLeft, ChevronRight } from "lucide-angular";

@Component({
    selector: 'testimonial-about-us',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
    <section class="bg-[#f6faff] py-15 relative overflow-hidden z-[1] block">
        <div class="relative">
            <div class="absolute -top-7.5 -left-10 animate-blinker">
                <img
                    alt="shape-image"
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/shape-04.png"
                />
            </div>
            <div class="absolute top-15 right-0 animate-blinker">
                <img
                    alt="shape-image"
                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/shape-05.png"
                />
            </div>
        </div>
        <div class="container mx-auto">
            <div class="flex w-full">
                <div class="px-3 relative w-full">
                    <button 
                        type="button" 
                        class="group block w-7.5 h-7.5 text-primary bg-borderGray shadow-[0_4px_14px_#e2edff40] cursor-pointer transition-smooth absolute top-1/2 -translate-y-1/2 rounded-full left-0 z-[1] flex-center-center hover:bg-secondary" 
                        (click)="slickModal.slickPrev()"
                    > 
                        <lucide-angular [img]="ChevronLeft" class="w-4 stroke-[#383838] stroke-[2] group-hover:stroke-white" />
                    </button>

                    <ngx-slick-carousel class="carousel w-full" 
                        #slickModal="slick-carousel" 
                        [config]="slideConfig" 
                        (init)="slickInit($event)"
                        (breakpoint)="breakpoint($event)"
                        (afterChange)="afterChange($event)"
                        (beforeChange)="beforeChange($event)"
                    >
                        @for (slide of slides; track slide.img) {
                            <div ngxSlickItem>
                                <div
                                    class="w-full inline-block m-0 px-15"
                                >
                                    <div class="flex items-center">
                                        <div class="rounded-full mr-6 w-55 flex-[0_0_220px]">
                                            <img
                                                class="rounded-full w-full"
                                                alt="client-image"
                                                src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/clients/client-05.jpg"
                                            />
                                        </div>
                                        <div>
                                            <div class="mb-4">
                                                <h6 class="text-base font-semibold text-secondary mb-0 leading-[1.2]">Testimonials</h6>
                                                <h2 class="text-[32px] mb-0 leading-[1.2] text-primary">What Our Client Says</h2>
                                            </div>
                                            <div>
                                                <p class="text-base mb-4 line-clamp-4 text-brandDark">
                                                    Doccure exceeded my expectations in healthcare.
                                                    The seamless booking process, coupled with the
                                                    expertise of the doctors, made my experience
                                                    exceptional. Their commitment to quality care and
                                                    convenience truly sets them apart. I highly
                                                    recommend Doccure for anyone seeking reliable and
                                                    accessible healthcare services..
                                                </p>
                                                <h6 class="text-[12px] mb-0 text-brandDark leading-[1.2]">
                                                    <span class="font-medium text-base text-primary block">Richard</span> 
                                                    Michigan
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </ngx-slick-carousel>
                    <button 
                        type="button" 
                        class="group block w-7.5 h-7.5 text-primary bg-borderGray shadow-[0_4px_14px_#e2edff40] cursor-pointer transition-smooth absolute top-1/2 -translate-y-1/2 rounded-full right-0 z-[1] flex-center-center hover:bg-secondary" 
                        (click)="slickModal.slickNext()"
                    > 
                        <lucide-angular [img]="ChevronRight" class="w-4 stroke-[#383838] stroke-[2] group-hover:stroke-white" />
                    </button>
                </div>
            </div>
        </div>
    </section>
    `,
    styles: `
        section:before {
            content: "";
            background: url('https://doccure.dreamstechnologies.com/react/template/assets/doctor-shape-img2-BiH_Rs31.png');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: right;
            position: absolute;
            right: 0;
            bottom: 0;
            opacity: .5;
            width: 213px;
            height: 335px;
            z-index: -1;
        }

        section:after {
            content: "";
            background: url('https://doccure.dreamstechnologies.com/react/template/assets/doctor-shape-img1-ygD6Rm6j.png');
            background-size: cover;
            background-repeat: no-repeat;
            background-position: left;
            position: absolute;
            top: 0;
            left: 0;
            width: 213px;
            height: 335px;
            opacity: .5;
            z-index: -1;
        }
    `
})

export class TestimonialAboutUsComponent {
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
        slidesToShow: 1,
        swipeToSlide: true,
        arrows: true,
        infinite: true,
        speed: 300,
        cssEase: 'ease-in-out',
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    dots: true
                }
            }
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
