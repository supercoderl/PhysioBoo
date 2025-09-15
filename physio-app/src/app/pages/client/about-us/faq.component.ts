import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { SquareMinus, SquarePlus } from "lucide-angular";

@Component({
    selector: 'faq-about-us',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <section class="py-15 bg-white relative overflow-hidden block">
        <div class="container mx-auto">
            <div class="flex justify-center">
                <div class="px-3">
                    <div class="mb-10 text-center">
                        <h6 class="font-semibold text-base text-secondary m-0 leading-[1.2]">Get Your Answer</h6>
                        <h2 class="text-[32px] mb-0 font-bold leading-[1.2] text-primary">Frequently Asked Questions</h2>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-2 items-center">
                <div class="px-3">
                    <div class="relative mb-10">
                        <img
                            alt="img"
                            src="https://doccure.dreamstechnologies.com/react/template/assets/faq-img-B8p_djQ0.png"
                        />
                        <div id="faq-count" class="bg-white rounded-[10px] p-3.75 min-w-55.5 absolute -bottom-10 left-1/2 -translate-x-1/2 flex-center-between">
                            <div class="mr-4">
                                <img
                                    alt="icon"
                                    src="https://doccure.dreamstechnologies.com/react/template/assets/smiling-icon-CW3eO8Bc.svg"
                                />
                            </div>
                            <div>
                                <h4 class="font-bold text-[24px] mb-0 text-primary leading-[1.2]">
                                    <span class="count-digit"><span>95</span></span
                                    >k+
                                </h4>
                                <p class="font-semibold text-base mb-0 text-brandDark">Happy Patients</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="px-3">
                    <div>
                        <div class="accordion">
                            <div 
                                class="bg-info rounded-[6px] mb-6 p-3.75"
                                *ngFor="let item of arr; let i = index"
                            >
                                <h2 class="relative m-0 text-[32px] font-bold text-primary leading-[1.2]" id="headingOne">
                                    <a
                                        (click)="toggleCollapse(i)"
                                        class="rounded-t-[5px] font-semibold m-0 text-primary relative cursor-pointer text-base flex-center-between"
                                        [attr.aria-expanded]="selectedIndex === i"
                                        aria-controls="collapseContent"
                                    >
                                        Can i make an Appointment Online with White Plains Hospital Kendi?
                                        <lucide-angular 
                                            [img]="selectedIndex === i ? SquareMinus : SquarePlus" 
                                            class='w-7  transition-transform duration-500 text-secondary'
                                            [class.rotate-180]="selectedIndex === i" 
                                        />
                                    </a>
                                </h2>
                                <div 
                                    id="collapseContent"
                                    class="collapse-content overflow-hidden transition-smooth ease-in-out"
                                    [class.expanded]="selectedIndex === i"
                                    [style.max-height]="selectedIndex === i ? maxHeight + 'px' : '0'"
                                >
                                    <div class="mt-3.75 pt-3.75 border-t border-solid border-[#ACB7C6]" #contentRef>
                                    <div>
                                        <p class="text-brandDark mb-0 text-xs15">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                                        sed do eiusmod tempor incididunt ut labore et dolore magna
                                        aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                                        ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                        Duis aute irure dolor in reprehenderit in voluptate velit
                                        esse cillum dolore eu fugiat nulla pariatur.
                                        </p>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `,
    styles: `
        #faq-count {
            box-shadow: 0 100px 80px #00000008,0 64.81px 46.85px #00000006,0 38.52px 25.48px #00000005,0 20px 13px #00000004,0 8.15px 6.52px #00000003,0 1.85px 3.15px #00000002;
        }
    `
})

export class FaqAboutUsComponent {
    selectedIndex = -1;
    maxHeight = 1000; // Adjust based on your content

    readonly arr = new Array(5);

    readonly SquareMinus = SquareMinus;
    readonly SquarePlus = SquarePlus;

    toggleCollapse(i: number) {
        this.selectedIndex === i ? this.selectedIndex = -1 : this.selectedIndex = i;
    }
}