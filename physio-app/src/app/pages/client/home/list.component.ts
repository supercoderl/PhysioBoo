import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared-imports';
import { CATEGORIES } from '../../../shared/data/dummy';

@Component({
    selector: 'list-home',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="relative -mt-10 z-[9]">
            <div class="container mx-auto">
                <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] rounded-2.5 relative flex flex-col bg-white">
                    <div class="p-10 flex-1">
                        <div class="flex-center-center md:justify-between flex-wrap gap-6">
                            <a 
                                *ngFor="let item of categories"
                                class="group text-neutral cursor-pointer transition-smooth block text-center" 
                                data-aos="fade-up"
                                data-aos-delay="100"
                                [href]="item.href"
                            >
                                <div 
                                    class="w-14 h-14 rounded-full inlineFlex-center-center mx-auto mb-2 border border-solid text-white"
                                    [style.backgroundColor]="item.color"
                                    [style.borderColor]="item.color"
                                >
                                    <img alt="img" [src]="item.icon" class="group-hover:animate-flip360" />
                                </div>
                                <h6 class="text-base font-semibold text-primary transition-smooth group-hover:text-blue-400">{{item.title}}</h6>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class ListHomeComponent {
    readonly categories = CATEGORIES;
}
