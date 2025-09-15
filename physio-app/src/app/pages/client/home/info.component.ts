import { Component } from "@angular/core";
import { Headphones, MessageSquare, LucideAngularModule } from "lucide-angular";

@Component({
    selector: 'info-home',
    standalone: true,
    template: `
        <section class="relative bottom-[-40px] z-[9] mt-[-40px] block">
            <div class="container mx-auto">
                <div class="contact-info p-15 rounded-[30px]">
                    <div class="flex-center-between gap-6 w-full">
                        <div class="m-0" data-aos="fade-up" data-aos-delay="100">
                            <h6 class="text-white text-[38px] font-bold m-0">Working for Your Better Health.</h6>
                        </div>
                        <div class="flex-center-end gap-6" data-aos="fade-up" data-aos-delay="100">
                            <div class="mb-0 items-center flex">
                                <span class="w-11 h-11 rounded-full bg-white flex-center-center">
                                    <lucide-angular [img]="HeadPhones" class="w-6 stroke-[#06aed4]" />
                                </span>
                                <div class="ml-2">
                                    <p class="white-space-nowrap text-white mb-1 text-xs15">Customer Support</p>
                                    <p class="white-space-nowrap text-white font-medium">+1 56589 54598</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="w-11 h-11 rounded-full bg-white flex-center-center">
                                    <lucide-angular [img]="MessageSquare" class="w-6 stroke-[#06aed4]" />
                                </span>
                                <div class="ml-2">
                                    <p class="white-space-nowrap text-white mb-1 text-xs15">Drop Us an Email</p>
                                    <p class="white-space-nowrap text-white font-medium">info1256&#64;example.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: `
        .contact-info
        {
            background: linear-gradient(90.08deg,#0e82fd .09%,#06aed4 70.28%);
        }
    `,
    imports: [LucideAngularModule]
})

export class InfoHomeComponent {
    readonly HeadPhones = Headphones;
    readonly MessageSquare = MessageSquare;
}