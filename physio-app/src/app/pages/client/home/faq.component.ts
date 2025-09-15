import { Component } from "@angular/core";
import { LucideAngularModule, Plus, SquareMinus } from "lucide-angular";
import { FAQs } from "../../../shared/data/dummy";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'faq-home',
    standalone: true,
    imports: [
        SharedModule,
        LucideAngularModule
    ],
    template: `
        <section class="py-15 block">
            <div class="container mx-auto">
                <div
                    class="mb-10 text-center"
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <span class="text-xs14 rounded-5 font-medium py-1.75 px-5 relative mb-3.75 text-white bg-secondary inline-block">FAQ’S</span>
                    <h2 class="text-2.5xl font-bold m-0 block">Your Questions are Answered</h2>
                </div>
                <div class="flex">
                    <div class="w-2/3 mx-auto px-3">
                        <div data-aos="fade-up" data-aos-delay="100">
                            <div id="faq-details">
                                <div 
                                    class="bg-white pb-6 border-b border-solid border-borderGray rounded-1.5 mb-6"
                                    *ngFor="let item of faqs; let i = index"
                                >
                                    <h2 class="relative m-0 text-2.5xl font-bold" [id]="'heading' + i">
                                        <a
                                            class="text-lg font-semibold text-primary m-0 cursor-pointer relative flex items-center justify-between"
                                            (click)="toggleFaq(i)"
                                            [attr.aria-expanded]="openFaqIndex === i"
                                            [attr.aria-controls]="'collapse' + i"
                                        >
                                            {{item.title}}

                                            <lucide-angular 
                                                [img]="openFaqIndex === i ? SquareMinus : Plus" 
                                                class="w-6 h-6 text-secondary transition-transform duration-200" 
                                            />
                                        </a>
                                    </h2>
                                    <div
                                        [id]="'collapse' + i"
                                        class="overflow-hidden transition-[max-height,opacity] duration-[1000ms] ease-in-out"
                                        [ngClass]="openFaqIndex === i ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'"
                                        [attr.aria-labelledby]="'heading' + i"
                                        [attr.aria-hidden]="openFaqIndex !== i"
                                    >
                                        <div class="pt-6" [class.hidden]="openFaqIndex !== i">
                                            <div>
                                                <p class="text-brandDark m-0 text-xs15">
                                                    {{item.description}}
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
})

export class FaqHomeComponent {
    readonly SquareMinus = SquareMinus;
    readonly Plus = Plus;

    // Track which FAQ is currently open (null means all closed)
    openFaqIndex: number | null = null;

    readonly faqs = FAQs;

    toggleFaq(index: number): void {
        // If clicking on the already open FAQ, close it
        if (this.openFaqIndex === index) {
            this.openFaqIndex = null;
        } else {
            // Otherwise, open the clicked FAQ
            this.openFaqIndex = index;
        }
    }
}