import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { Star } from "lucide-angular";
import { TESTIMONIAL_COUNTERS } from "../../../shared/data/dummy";

@Component({
    selector: 'testimonial-home',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
            <section id="testimonial" class="py-15 !bg-cover">
                <div class="container mx-auto">
                    <div
                        class="mb-10 text-center"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        <span class="text-xs14 rounded-5 font-medium py-[7px] px-5 relative mb-[15px] text-white bg-secondary inline-block">Testimonials</span>
                        <h2 class="text-2.5xl font-bold m-0 block">15k Users Trust Doccure Worldwide</h2>
                    </div>
                    <div data-aos="fade-up" data-aos-delay="100">
                        <div class="relative block">
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
                                        class="mr-6 w-full inline-block border border-solid border-borderGray bg-white rounded-2.5"
                                    >
                                        <div class="p-5">
                                            <div class="flex items-center mb-6">
                                                <div class="flex mb-2 w-full">
                                                    <lucide-angular [img]="Star" class="w-5 fill-[#ffca18] stroke-[#ffca18]" />
                                                    <lucide-angular [img]="Star" class="w-5 fill-[#ffca18] stroke-[#ffca18]" />
                                                    <lucide-angular [img]="Star" class="w-5 fill-[#ffca18] stroke-[#ffca18]" />
                                                    <lucide-angular [img]="Star" class="w-5 fill-[#ffca18] stroke-[#ffca18]" />
                                                    <lucide-angular [img]="Star" class="w-5 fill-[#ffca18] stroke-[#ffca18]" />
                                                </div>
                                                <span>
                                                    <img
                                                        alt="img"
                                                        class="block"
                                                        src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/icons/quote-icon.svg"
                                                    />
                                                </span>
                                            </div>
                                            <h6 class="text-[1rem] font-medium mb-2">Good Hospitability</h6>
                                            <p class="mb-4 text-xs15">
                                                Genuinely cares about his patients. He helped me understand my condition
                                                and worked with me to create a plan.
                                            </p>
                                            <div class="flex items-center">
                                                <a
                                                    class="text-[2.813rem] h-[2.813rem] relative inline-block"
                                                    href="/react/template/index"
                                                >
                                                    <img
                                                        class="block rounded-full object-cover w-full h-full"
                                                        alt="img"
                                                        src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/patients/patient21.jpg"
                                                    />
                                                </a>
                                                <div class="ml-2">
                                                    <h6 class="mb-1 text-lg font-semibold">
                                                        <a href="https://doccure.dreamstechnologies.com/react/template/index" class="text-neutral transition-smooth">
                                                            Johnson DWayne
                                                        </a>
                                                    </h6>
                                                    <p class="text-[0.875rem] m-0">United States</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>    
                                }         
                            </ngx-slick-carousel>
                        </div>
                    </div>
                    <div class="pt-15">
                        <div
                            class="grid grid-cols-5"
                        >
                        <div
                            class="text-center mx-3"
                            data-aos="fade-up"
                            data-aos-delay="100"
                            *ngFor="let item of testimonials"
                        >
                            <h6
                                id="count"
                                class="relative text-[38px] font-bold before:content-[''] before:w-25 before:h-1 before:left-1/2 before:bottom-[5px] before:absolute before:-translate-x-1/2"
                                [ngStyle]="{ '--before-bg': item.color }"
                            >
                                <span>{{ item.count }}</span>
                            </h6>
                            <p class="m-0 text-xs15">{{ item.title }}</p>
                        </div>
                    </div>
                    </div>
                </div>
            </section>
    `,
    styles: `
        #testimonial {
            background: url('https://doccure.dreamstechnologies.com/react/template/assets/testimonial-bg-TnWcQqJd.jpg');
        }

        
        #count::before {
            background-color: var(--before-bg);
        }
    `
})

export class TestimonialHomeComponent {
    readonly Star = Star;
    readonly testimonials = TESTIMONIAL_COUNTERS;

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
        slidesToShow: 3,
        slidesToScroll: 1,
        touchThreshold: 20,
        swipeToSlide: true,
        arrows: false
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