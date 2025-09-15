import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { AudioLines, BriefcaseMedical, SquareUser } from "lucide-angular";

@Component({
    selector: 'reason-home',
    standalone: true,
    imports: [SharedModule],
    template: `
        <section class="py-15 block">
            <div class="container mx-auto">
                <div
                    class="mb-10 text-center"
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <span class="text-xs14 rounded-5 font-medium py-1.75 px-5 relative mb-3.75 text-white bg-secondary inline-block">Why Book With Us</span>
                    <h2 class="text-2.5xl font-bold m-0 block">Compelling Reasons to Choose</h2>
                </div>
                <div class="grid grid-cols-3 justify-center">
                    <div class="mx-3">
                        <div class="p-5" data-aos="fade-up" data-aos-delay="100">
                            <h6 class="mb-2 text-lg font-semibold text-primary flex items-center">
                                <lucide-angular [img]="SquareUser" class="mr-2 stoke-danger w-4.5" />
                                Follow-Up Care
                            </h6>
                            <p class="text-[0.875rem] mb-0 text-brandDark">
                                We ensure continuity of care through regular follow-ups and
                                communication, helping you stay on track with health goals.
                            </p>
                        </div>
                    </div>
                    <div class="mx-3">
                        <div class="p-5 border-l border-dashed border-[#E3E6EC]" data-aos="fade-up" data-aos-delay="100">
                            <h6 class="mb-2 text-lg font-semibold text-primary flex items-center">
                                <lucide-angular [img]="AudioLines" class="mr-2 stroke-[#6938ef] w-4.5" />
                                Patient-Centered Approach
                            </h6>
                            <p class="text-[0.875rem] mb-0 text-brandDark">
                                We prioritize your comfort and preferences, tailoring our services
                                to meet your individual needs and Care from Our Experts
                            </p>
                        </div>
                    </div>
                    <div class="mx-3">
                        <div class="p-5 border-l border-dashed border-[#E3E6EC]" data-aos="fade-up" data-aos-delay="100">
                            <h6 class="mb-2 text-lg font-semibold text-primary flex items-center">
                                <lucide-angular [img]="BriefcaseMedical" class="mr-2 stroke-[#06aed4] w-4.5" />
                                Convenient Access
                            </h6>
                            <p class="text-[0.875rem] mb-0 text-brandDark">
                                Easily book appointments online or through our dedicated customer
                                service team, with flexible hours to fit your schedule.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    styles: `
        section {
            background: url('https://doccure.dreamstechnologies.com/react/template/assets/reason-bg-dAo8eiKF.svg') no-repeat;
        }
    `
})

export class ReasonHomeComponent {
    readonly SquareUser = SquareUser;
    readonly AudioLines = AudioLines;
    readonly BriefcaseMedical = BriefcaseMedical;
}