import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { Star } from "lucide-angular";
import { COMPANYLOGOS } from "../../../shared/data/dummy";

@Component({
    selector: 'company-home',
    standalone: true,
    imports: [
        SharedModule,
        SlickCarouselModule
    ],
    template: `
            <section
                class="py-15 rounded-b-7.5 bg-[#000f28] border border-solid border-[#000f28] text-white block"
                data-aos="fade-up"
                data-aos-delay="100"
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
                                        class="mr-6 w-full inline-block" 
                                    >
                                        <img
                                            alt="img"
                                            class="w-auto block"
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
        arrows: false
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