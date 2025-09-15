import { Component } from "@angular/core";
import { SharedModule } from "../../../shared/shared-imports";
import { BreadcrumbComponent } from "../../../components/breadcrumb/breadcrumb.component";
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
        <div class="min-h-50 pt-15 pb-9">
            <div class="container mx-auto">
                <div class="grid grid-cols-3 -mx-3">
                    <grid-blog class="col-span-2"></grid-blog>
                    <side-bar-blog></side-bar-blog>
                </div>
            </div>
        </div>
    `
})

export class BlogComponent {}