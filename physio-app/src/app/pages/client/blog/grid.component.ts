import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { AlarmClock } from "lucide-angular";
import { BLOGS } from "../../../shared/data/dummy";

@Component({
    selector: 'grid-blog',
    standalone: true,
    imports: [
        SharedModule
    ],
    template: `
        <div class="px-3">
            <div class="grid grid-cols-2">
                <div class="px-3" *ngFor="let blog of blogs">
                    <div class="p-5 border border-solid border-borderGray bg-white relative rounded-[10px] mb-6">
                        <div class="mb-4 overflow-hidden rounded-[10px] relative block w-full">
                            <a href="/react/template/blog/blog-grid" class="block relative w-full text-neutral transition-smooth">
                                <img
                                    class="transition-[all_2s_cubic-bezier(.19,1,.22,1)_0ms] translate-z-0 rounded-[10px] block realtive w-full"
                                    alt="Post Image"
                                    [src]="blog.thumbnail"
                                />
                            </a>
                            <span class="text-xs14 font-medium rounded-[20px] absolute top-3.75 left-3.75 py-1.25 px-1.75 bg-[#06aed4] text-white leading-[14px]">
                                {{blog.category}}
                            </span>
                        </div>
                        <div class="relative">
                            <ul class="flex-center-between flex-wrap m-0 text-primary gap-2">
                                <li class="mb-4 inline-block text-xs15">
                                    <div class="w-47.25 truncate">
                                        <a
                                            href="/react/template/patient/doctor-profile"
                                            class="flex items-center font-medium text-neutral transition-smooth"
                                        >
                                            <img
                                                alt="Post Author"
                                                [src]="blog.author.avatar"
                                                class="w-6 mr-2 rounded-full"
                                            />
                                            <span>{{blog.author.name}}</span>
                                        </a>
                                    </div>
                                </li>
                                <li class="mr-0 mb-4 inline-block text-xs15 flex items-center">
                                    <lucide-angular [img]="AlarmClock" class="w-3.75 mr-1" />
                                    {{blog.postedAt}}
                                </li>
                            </ul>
                            <h3 class="text-lg mb-2 line-clamp-2 font-semibold text-primary">
                                <a href="/react/template/blog/blog-grid" class="text-neutral cursor-pointer transition-smooth">
                                    {{blog.title}}
                                </a>
                            </h3>
                            <p class="m-0 line-clamp-2 text-brandDark">
                                {{blog.description}}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex-center-center -mx-3">
                <div class="p-3">
                    <div class="flex-center-center mt-4 mb-6">
                        <ul class="flex-center-center flex-wrap gap-2.5 m-0">
                            <li class="text-xs15">
                                <a
                                    class="w-auto leading-[21px] px-4 py-1.5 rounded-full bg-white border-borderGray h-7.5 text-primary inline-flex-center-center text-xs14 relative border border-solid cursor-pointer transition-smooth hover:bg-secondary hover:text-white"
                                    href="/react/template/blog/blog-grid"
                                >
                                    Prev
                                </a>
                            </li>
                            <li class="text-xs15">
                                <a
                                    class="w-7.5 px-3 py-1.5 rounded-full bg-white border-borderGray h-7.5 text-primary inline-flex-center-center text-xs14 relative border border-solid cursor-pointer transition-smooth hover:bg-secondary hover:text-white"
                                    href="/react/template/blog/blog-grid"
                                >
                                    1
                                </a>
                            </li>
                            <li class="text-xs15">
                                <a
                                    class="w-7.5 px-3 py-1.5 rounded-full bg-secondary border-borderGray h-7.5 text-white inline-flex-center-center text-xs14 relative border border-solid cursor-pointer transition-smooth hover:bg-secondary hover:text-white"
                                    href="/react/template/blog/blog-grid"
                                >
                                    2
                                </a>
                            </li>
                            <li class="text-xs15">
                                <a
                                    class="w-7.5 px-3 py-1.5 rounded-full bg-white border-borderGray h-7.5 text-primary inline-flex-center-center text-xs14 relative border border-solid cursor-pointer transition-smooth hover:bg-secondary hover:text-white"
                                    href="/react/template/blog/blog-grid"
                                >
                                    3
                                </a>
                            </li>
                            <li class="text-xs15">
                                <a
                                    class="w-7.5 px-3 py-1.5 rounded-full bg-white border-borderGray h-7.5 text-primary inline-flex-center-center text-xs14 relative border border-solid cursor-pointer transition-smooth hover:bg-secondary hover:text-white"
                                    href="/react/template/blog/blog-grid"
                                >
                                    4
                                </a>
                            </li>
                            <li class="text-xs15">
                                <a
                                class="w-auto px-4 py-1.5 rounded-full bg-white border-borderGray h-7.5 text-primary inline-flex-center-center text-xs14 relative border border-solid cursor-pointer transition-smooth hover:bg-secondary hover:text-white"
                                href="/react/template/blog/blog-grid"
                                >
                                    Next
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `
})

export class GridBlogComponent {
    readonly AlarmClock = AlarmClock;
    readonly blogs = BLOGS;
}