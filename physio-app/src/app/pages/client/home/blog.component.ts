import { Component } from "@angular/core";
import { ChevronRight } from "lucide-angular";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'blog-home',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
    <section class="py-15 block">
        <div class="container mx-auto">
            <div
                class="mb-10 text-center"
                data-aos="fade-up"
                data-aos-delay="100"
            >
                <span class="text-xs14 rounded-5 font-medium py-1.75 px-5 relative mb-3.75 text-white bg-secondary inline-block">Recent Blogs</span>
                <h2 class="text-2.5xl font-bold m-0">Stay Updated With Our Latest Articles</h2>
            </div>
            <div class="grid grid-cols-2 gap-6">
                <div class="mt-6 px-3" *ngFor="let index of arr">
                    <div class="rounded-2.5 shadow-[0_4px_14px_#e2edff40] overflow-hidden flex items-center" data-aos="fade-up">
                        <div class="relative w-full h-full overflow-hidden rounded-2.5">
                            <a href="/react/template/blog/blog-details" class="overflow-hidden w-full h-full">
                                <img
                                    class="w-full object-cover rounded-2.5 transition-all duration-[800ms] hover:scale-125"
                                    alt="img"
                                    src="https://doccure.dreamstechnologies.com/react/template/src/assets/img/blog/article-01.jpg"
                                />
                            </a>
                            <!-- Date Badge -->
                            <div class="w-15 h-15 rounded-2.5 absolute top-3.75 left-3.75 bg-white text-center p-1.5">
                                <span class="text-lg font-semibold text-primary block">15</span>
                                <span class="text-xs text-gray-600">May</span>
                            </div>
                        </div>
                        
                        <div class="p-6">
                            <span class="text-xs14 leading-3.5 rounded-5 font-medium py-1.25 px-2 bg-[#06aed4] text-white mb-2 inline-block text-center">
                                Treatments
                            </span>
                            <h6 class="mb-2 line-clamp-2 text-lg font-semibold">
                                <a href="/react/template/blog/blog-details" class="text-primary">
                                    Understanding and Preventing Glaucoma: A Detailed Guide
                                </a>
                            </h6>
                            <p class="m-0 line-clamp-2 text-gray-600 text-xs15">
                                Glaucoma is a leading cause of blind worldwide, yet many....
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="mt-10 text-center"
                data-aos="fade-up"
                data-aos-delay="100"
            >
                <a
                    class="py-2.25 px-4 mx-auto bg-primary border border-solid border-primary text-white text-xs14 transition-smooth font-medium flex items-center w-fit rounded-full hover:text-white"
                    href="/react/template/index/blog/blog-grid"
                >
                    View All Articles
                    <i nz-icon nzType="right" nzTheme="outline" class="text-[10px] ml-1"></i>
                </a>
            </div>
        </div>
    </section>
    `
})

export class BlogHomeComponent {
    readonly ChevronRight = ChevronRight;
    readonly arr = new Array(4);
}