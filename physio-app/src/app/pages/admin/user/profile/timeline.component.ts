import { Component } from "@angular/core";
import { AdminPostCardComponent } from "../../../../components/layout/admin/post/post-card/post-card.component";
import { PostareaComponent } from "../../../../components/textarea/postarea/postarea/postarea.component";

@Component({
    selector: 'profile-timeline',
    standalone: true,
    imports: [PostareaComponent, AdminPostCardComponent],
    template: `
        <div class="gap-4 md:flex md:gap-6">
            <div class="flex w-full flex-col pb-4 md:w-80">
                <div
                    class="pt-6 px-8 flex flex-col w-full bg-white text-[#1F232B] shadow-xs overflow-hidden rounded-[12px]"
                >
                    <div class="flex items-center justify-between pb-4">
                        <p
                            class="font-semibold leading-[1.25 text-lg m-0"
                        >
                            Latest Activity
                        </p>
                        <button
                            class="font-medium -mx-2 inlineFlex-center-center relative cursor-pointer align-middle min-h-7 min-w-7 rounded-[8px] py-1.5 px-3"
                            tabindex="0"
                            type="button"
                        >
                            See All
                        </button>
                    </div>
                    <div class="p-0">
                        <ul class="p-0 list-none m-0">
                            <li class="flex items-center relative w-full py-2">
                                <div class="shrink-0 min-w-11">
                                    <div class="relative flex-center-center rounded-full leading-none overflow-hidden w-9 h-9">
                                        <img
                                            alt="Bernard Langley"
                                            class="w-full h-full text-center bg-cover"
                                            src="https://fuse-react-vitejs-demo.fusetheme.com/assets/images/avatars/male-02.jpg"
                                        />
                                    </div>
                                </div>
                                <div
                                    class="flex-1 my-1.5"
                                >
                                    <span class="block m-0 text-[13px] leading-[1.5]">
                                        <div class="flex">
                                            <p
                                                class="whitespace-nowrap m-0 text-[13px] leading-[1.5] text-[#1565C0]"
                                            >
                                                Bernard Langley
                                            </p>
                                            <p
                                                class="px-1 truncate m-0 text-[13px] leading-[1.5]"
                                            >
                                                started following you.
                                            </p>
                                        </div>
                                    </span>
                                    <p
                                        class="m-0 leading-[1.43] text-[13px] text-[#4B5563] block"
                                    >
                                        13 mins. ago
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="flex flex-1 flex-col">
                <postarea class="md:mb-8 mb-4"></postarea>
            </div>
            <admin-post-card class="md:mb-8 mb-4"></admin-post-card>
        </div>
    `
})

export class ProfileTimelineComponent {

}