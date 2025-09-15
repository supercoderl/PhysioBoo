import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'services-home',
    standalone: true,
    imports: [SharedModule],
    template: `
        <section class="py-3.25 block group" data-aos="fade-up" data-aos-delay="100">
            <div class="overflow-hidden flex">
                <div class="flex gap-6 w-max nowrap animate-tuck group-hover:[animation-play-state:paused]">
                    <div 
                        class="relative pr-14 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:right-0 before:w-10 before:h-[2px] before:bg-[#75c7e2]"
                        *ngFor="let index of arr"
                    >
                        <h6 class="whitespace-nowrap text-xs14 font-medium text-primary m-0">
                            <a 
                                href="https://doccure.dreamstechnologies.com/react/template/index" 
                                class="text-white transition-smooth hover:text-white"
                            >
                                Multi Speciality Treatments &amp; Doctors
                            </a>
                        </h6>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: `
        section {
            background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
        }
    `
})

export class ServicesHomeComponent {
    readonly arr = new Array(12);
}