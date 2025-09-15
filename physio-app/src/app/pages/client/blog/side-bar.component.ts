import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { Search } from "lucide-angular";

@Component({
    selector: 'side-bar-blog',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="px-3">
            <div class="sticky top-0">
                <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-[10px] flex relative">
                    <div class="p-5 flex-1">
                        <form>
                            <div class="border border-solid border-borderGray rounded-[10px] min-h-14 p-2 relative flex flex-wrap items-stretch w-full">
                                <input
                                    placeholder="Search..."
                                    class="pl-2 relative flex-1 w-[1%] text-primary min-h-9.5 bg-white text-xs14 leading-[1.6] rounded-[5px] py-1.75 px-3.75 transition-smooth block"
                                    type="text"
                                />
                                <button type="submit" class="w-10 h-10 text-base rounded-[5px] flex-center-center bg-[linear-gradient(90.08deg,#0e82fd_.09%,#06aed4_70.28%)] text-white relative overflow-hidden z-[1] bg-secondary border border-solid border-secondary cursor-pointer font-medium transition-smooth">
                                    <lucide-angular [img]="Search" class="w-4 stroke-white" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-[10px] flex relative">
                    <div class="p-5 flex-1">
                        <h5 class="mb-4 text-[20px] font-semibold text-primary leading-[1.2]">Latest News</h5>
                        <ul class="m-0">
                            <li class="flex w-full mb-4 text-xs15">
                                <div class="rounded-[5px] overflow-hidden">
                                    <a href="/react/template/blog/blog-grid" class="text-neutral cursor-pointer transition-smooth">
                                        <img
                                            class="rounded-[5px] translate-z-0 transition-[all_2s_cubic-bezier(.19,1,.22,1)_0ms] w-17.75 h-17.75 object-cover"
                                            alt="blog-image"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-thumb-11.jpg"
                                        />
                                    </a>
                                </div>
                                <div class="ml-3.5">
                                    <p class="text-xs14 mb-1 text-brandDark">06 Nov 2025</p>
                                    <h4 class="text-base font-medium line-clamp-2 leading-[1.2]">
                                        <a href="/react/template/blog/blog-grid" class="text-neutral transition-smooth">
                                            Managing Chronic Conditions: Expert Advice for Better Living
                                        </a>
                                    </h4>
                                </div>
                            </li>
                            <li class="flex w-full mb-4 text-xs15">
                                <div class="rounded-[5px] overflow-hidden">
                                    <a href="/react/template/blog/blog-grid" class="text-neutral cursor-pointer transition-smooth">
                                        <img
                                            class="rounded-[5px] translate-z-0 transition-[all_2s_cubic-bezier(.19,1,.22,1)_0ms] w-17.75 h-17.75 object-cover"
                                            alt="blog-image"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-thumb-12.jpg"
                                        />
                                    </a>
                                </div>
                                <div class="ml-3.5">
                                    <p class="text-xs14 mb-1 text-brandDark">15 Nov 2025</p>
                                    <h4 class="text-base font-medium line-clamp-2 leading-[1.2]">
                                        <a href="/react/template/blog/blog-grid" class="text-neutral transition-smooth">
                                            Understanding Common Symptoms: When to See a Doctor
                                        </a>
                                    </h4>
                                </div>
                            </li>
                            <li class="flex w-full mb-4 text-xs15">
                                <div class="rounded-[5px] overflow-hidden">
                                    <a href="/react/template/blog/blog-grid" class="text-neutral cursor-pointer transition-smooth">
                                        <img
                                            class="rounded-[5px] translate-z-0 transition-[all_2s_cubic-bezier(.19,1,.22,1)_0ms] w-17.75 h-17.75 object-cover"
                                            alt="blog-image"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-thumb-13.jpg"
                                        />
                                    </a>
                                </div>
                                <div class="ml-3.5">
                                    <p class="text-xs14 mb-1 text-brandDark">08 Dec 2025</p>
                                    <h4 class="text-base font-medium line-clamp-2 leading-[1.2]">
                                        <a href="/react/template/blog/blog-grid" class="text-neutral transition-smooth">
                                            Nutrition and Wellness: A Guide to Balanced Eating
                                        </a>
                                    </h4>
                                </div>
                            </li>
                            <li class="flex w-full mb-4 text-xs15">
                                <div class="rounded-[5px] overflow-hidden">
                                    <a href="/react/template/blog/blog-grid" class="text-neutral cursor-pointer transition-smooth">
                                        <img
                                            class="rounded-[5px] translate-z-0 transition-[all_2s_cubic-bezier(.19,1,.22,1)_0ms] w-17.75 h-17.75 object-cover"
                                            alt="blog-image"
                                            src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/blog-thumb-14.jpg"
                                        />
                                    </a>
                                </div>
                                <div class="ml-3.5">
                                    <p class="text-xs14 mb-1 text-brandDark">17 Dec 2025</p>
                                    <h4 class="text-base font-medium line-clamp-2 leading-[1.2]">
                                        <a href="/react/template/blog/blog-grid" class="text-neutral transition-smooth">
                                            Top Preventive Health Measures Everyone Should Take
                                        </a>
                                    </h4>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-[10px] flex relative">
                    <div class="p-5 flex-1">
                        <h5 class="mb-4 text-[20px] font-semibold leading-[1.2] text-primary">Categories</h5>
                        <ul class="m-0">
                            <li class="mb-4 text-xs15">
                                <a href="/react/template/blog/blog-grid" class="text-brandDark cursor-pointer transition-smooth">
                                    Health Care <span class="float-right text-primary text-xs14">(2)</span>
                                </a>
                            </li>
                            <li class="mb-4 text-xs15">
                                <a href="/react/template/blog/blog-grid" class="text-brandDark cursor-pointer transition-smooth">
                                    Nutritions <span class="float-right text-primary text-xs14">(4)</span>
                                </a>
                            </li>
                            <li class="mb-4 text-xs15">
                                <a href="/react/template/blog/blog-grid" class="text-brandDark cursor-pointer transition-smooth">
                                    Health Tips <span class="float-right text-primary text-xs14">(5)</span>
                                </a>
                            </li>
                            <li class="mb-4 text-xs15">
                                <a href="/react/template/blog/blog-grid" class="text-brandDark cursor-pointer transition-smooth">
                                    Medical Research <span class="float-right text-primary text-xs14">(4)</span>
                                </a>
                            </li>
                            <li class="mb-4 text-xs15">
                                <a href="/react/template/blog/blog-grid" class="text-brandDark cursor-pointer transition-smooth">
                                    Health Treatment <span class="float-right text-primary text-xs14">(6)</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="border border-solid border-borderGray shadow-[0_4px_14px_#e2edff40] mb-6 rounded-[10px] flex relative">
                    <div class="p-5 flex-1">
                        <h5 class="mb-4 text-[20px] font-semibold text-primary leading-[1.2]">Tags</h5>
                        <ul class="overflow-hidden m-0 gap-4 flex flex-wrap">
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Health Tips
                                </a>
                            </li>
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Awareness
                                </a>
                            </li>
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Health
                                </a>
                            </li>
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Wellness
                                </a>
                            </li>
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Treatments
                                </a>
                            </li>
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Checkup
                                </a>
                            </li>
                            <li class="float-left text-xs15">
                                <a
                                    class="tag"
                                    href="/react/template/blog/blog-grid"
                                    class="bg-info text-primary relative text-xs14 font-medium inline-block rounded-[20px] py-0.5 px-2 cursor-pointer transition-smooth"
                                >
                                    Prevention
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
         </div>
    `
})

export class SideBarBlogComponent {
    readonly Search = Search;
}