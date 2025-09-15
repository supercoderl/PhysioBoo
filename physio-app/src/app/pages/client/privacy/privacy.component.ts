import { Component } from "@angular/core";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { CircleCheck } from "lucide-angular";
import { SharedModule } from "../../../shared/shared-imports";

@Component({
    selector: 'app-privacy',
    standalone: true,
    template: `
        <breadcrumb title="Privacy Policy"></breadcrumb>
        <section class="py-15 block">
            <div class="container mx-auto">
                <div class="flex">
                    <div class="px-3">
                        <div>
                            <div class="pb-6 mb-4">
                                <p class="text-base text-[#6b7280] mb-6">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                    enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                                    reprehenderit in voluptate velit esse cillum dolore eu fugiat
                                    nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                                <p class="text-base text-[#6b7280] mb-6">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                                    accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                                    quae ab illo inventore veritatis et quasi architecto beatae vitae
                                    dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
                                    aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
                                    eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
                                    est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
                                    velit, sed quia non numquam eius modi tempora incidunt ut labore
                                    et dolore magnam aliquam quaerat voluptatem.
                                </p>
                                <p class="text-base text-[#6b7280]">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                    enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                                    reprehenderit in voluptate velit esse cillum dolore eu fugiat
                                    nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>
                            <div class="pb-6 mb-4">
                                <p class="mb-2.5 inline-flex items-start text-base text-[#6b7280] flex items-center">
                                    <lucide-angular [img]="CircleCheck" class="w-5 mr-2 fill-secondary stroke-white" /> At vero eos et accusamus et
                                    iusto odio dignissimos ducimus qui blanditiis praesentium
                                    voluptatum deleniti atque corrupti quos dolores et
                                </p>
                                <p class="mb-2.5 inline-flex items-start text-base text-[#6b7280] flex items-center">
                                    <lucide-angular [img]="CircleCheck" class="w-5 mr-2 fill-secondary stroke-white" /> Sed ut perspiciatis unde omnis
                                    iste natus error sit voluptatem accusantium doloremque laudantium,
                                </p>
                                <p class="mb-2.5 inline-flex items-start text-base text-[#6b7280] flex items-center">
                                    <lucide-angular [img]="CircleCheck" class="w-5 mr-2 fill-secondary stroke-white" /> Nemo enim ipsam voluptatem
                                    quia voluptas sit aspernatur aut odit aut fugit, sed quia
                                    consequuntur magni dolores eos qui ratione voluptatem sequi
                                    nesciunt.
                                </p>
                                <p class="mb-2.5 inline-flex items-start text-base text-[#6b7280] flex items-center">
                                    <lucide-angular [img]="CircleCheck" class="w-5 mr-2 fill-secondary stroke-white" /> At vero eos et accusamus et
                                    iusto odio dignissimos ducimus qui blanditiis praesentium
                                    voluptatum deleniti atque corrupti quos dolores et
                                </p>
                                <p class="mb-2.5 inline-flex items-start text-base text-[#6b7280] flex items-center">
                                    <lucide-angular [img]="CircleCheck" class="w-5 mr-2 fill-secondary stroke-white" /> Sed ut perspiciatis unde omnis
                                    iste natus error sit voluptatem accusantium doloremque laudantium,
                                </p>
                                <p class="mb-2.5 inline-flex items-start text-base text-[#6b7280] flex items-center">
                                    <lucide-angular [img]="CircleCheck" class="w-5 mr-2 fill-secondary stroke-white" /> Nemo enim ipsam voluptatem
                                    quia voluptas sit aspernatur aut odit aut fugit, sed quia
                                    consequuntur magni dolores eos qui ratione voluptatem sequi
                                    nesciunt.
                                </p>
                            </div>
                            <div class="pb-6 mb-4">
                                <p class="text-base text-[#6b7280] mb-6">
                                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                                    accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                                    quae ab illo inventore veritatis et quasi architecto beatae vitae
                                    dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
                                    aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
                                    eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
                                    est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
                                    velit, sed quia non numquam eius modi tempora incidunt ut labore
                                    et dolore magnam aliquam quaerat voluptatem.
                                </p>
                                <p class="text-base text-[#6b7280] mb-6">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                                    enim ad minim veniam, quis nostrud exercitation ullamco laboris
                                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                                    reprehenderit in voluptate velit esse cillum dolore eu fugiat
                                    nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `,
    imports: [
        BreadcrumbComponent,
        SharedModule
    ]
})

export class PrivacyComponent {
    readonly CircleCheck = CircleCheck;
}