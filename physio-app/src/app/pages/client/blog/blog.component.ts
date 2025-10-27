import { Component } from "@angular/core";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
import { SharedModule } from "../../../shared/shared-imports";
import { GridBlogComponent } from "./grid.component";
import { SideBarBlogComponent } from "./side-bar.component";

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [
    SharedModule,
    BreadcrumbComponent,
    GridBlogComponent,
    SideBarBlogComponent
],
    template: `
        <breadcrumb title="Blog"></breadcrumb>
        <div class="min-h-50 pt-10 md:pt-15 px-4 md:pb-9">
            <div class="container mx-auto">
                <div class="md:grid grid-cols-3 -mx-3">
                    <grid-blog md:class="col-span-2"></grid-blog>
                    <side-bar-blog></side-bar-blog>
                </div>
            </div>
        </div>
    `
})

export class BlogComponent {}