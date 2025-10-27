import { Component } from "@angular/core";
import { Star } from "lucide-angular";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { COMPANYLOGOS } from "../../../shared/data/dummy";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'company-home',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
            <section
                class="py-12.5 md:py-15 rounded-b-7.5 bg-[#000f28] border border-solid border-[#000f28] text-white block"
            >
                <div class="container mx-auto">
                    <div class="mb-10 text-center">
                        <h6 class="text-base font-medium text-white">
                            Trusted by 5+ million people at companies like
                        </h6>
                    </div>
                    <div>
                        <div class="relative block">
                            <ngx-slick-carousel class="carousel" 
                                #slickModal="slick-carousel" 
                                [config]="slideConfig" 
                                (init)="slickInit($event)"
                                (breakpoint)="breakpoint($event)"
                                (afterChange)="afterChange($event)"
                                (beforeChange)="beforeChange($event)"
                            >
                                @for (slide of logos; track slide) {
                                    <div 
                                        ngxSlickItem
                                        class="px-3 w-full inline-block" 
                                    >
                                        <img
                                            alt="img"
                                            class="w-auto block mx-auto md:mx-0"
                                            [src]="slide"
                                            loading="lazy"
                                        />
                                    </div>  
                                }         
                            </ngx-slick-carousel>
                        </div>
                    </div>
                </div>
            </section>
    `,
})

export class CompanyHomeComponent {
    readonly Star = Star;
    readonly logos = COMPANYLOGOS;

    slideConfig = { 
        slidesToShow: 8, 
        slidesToScroll: 1,
        touchThreshold: 20,
        swipeToSlide: true,
        arrows: false,
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
        this.logos.push("http://placehold.it/350x150/777777")
    }

    removeSlide() {
        this.logos.length = this.logos.length - 1;
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