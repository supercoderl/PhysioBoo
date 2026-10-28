import { Component, inject } from "@angular/core";
import { CommonCategoryLabTestCategoryDrawerComponent } from "../../../../../components/layout/admin/system/common-category/lab-test-category/lab-test-category-drawer.component";
import { CommonCategoryLabTestCategoryTableCardComponent } from "../../../../../components/layout/admin/system/common-category/lab-test-category/lab-test-category-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { LabTestCategoryService } from "../../../../../services/admin/lab-test-category.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabTestCategory } from "../../../../../shared/types/laboratory-imaging.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-lab-test-category-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryLabTestCategoryTableCardComponent,
        CommonCategoryLabTestCategoryDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryLabTestCategoryListComponent extends CommonCategoryListBase<LabTestCategory> {
    private readonly categorySrv = inject(LabTestCategoryService);

    constructor() {
        const service = inject(LabTestCategoryService);
        super({
            service,
            noun: ['lab test category', 'lab test categories'],
            permissions: {
                create: Permissions.Lab.LabTestCategoryCreate,
                update: Permissions.Lab.LabTestCategoryUpdate,
                delete: Permissions.Lab.LabTestCategoryDelete
            },
            itemName: item => item.name,
        });
    }

    /**
     * The lab test pages read categories from a cached lookup. Every save and delete here ends in a reload,
     * so dropping the cache on load keeps those pages in step.
     */
    override load(): void {
        this.categorySrv.clearLookupCache();
        super.load();
    }
}
