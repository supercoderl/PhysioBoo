import { Component, inject } from "@angular/core";
import { CommonCategoryLabTestDrawerComponent } from "../../../../../components/layout/admin/system/common-category/lab-test/lab-test-drawer.component";
import { CommonCategoryLabTestTableCardComponent } from "../../../../../components/layout/admin/system/common-category/lab-test/lab-test-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { LabTestService } from "../../../../../services/admin/lab-test.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { LabTest } from "../../../../../shared/types/laboratory-imaging.types";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LabTestCategoryService } from "../../../../../services/admin/lab-test-category.service";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-lab-test-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryLabTestTableCardComponent,
        CommonCategoryLabTestDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryLabTestListComponent extends CommonCategoryListBase<LabTest> {
    /** Category names by id from the lab test category lookup, for the category column. */
    categoryNames: Record<string, string> = {};

    constructor() {
        const service = inject(LabTestService);
        super({
            service,
            noun: ['lab test', 'lab tests'],
            permissions: {
                create: Permissions.Lab.LabTestCreate,
                update: Permissions.Lab.LabTestUpdate,
                delete: Permissions.Lab.LabTestDelete
            },
            itemName: item => item.testName,
        });

        inject(LabTestCategoryService).lookup()
            .pipe(takeUntilDestroyed())
            .subscribe(options => this.categoryNames = Object.fromEntries(options.map(o => [o.value, o.label])));
    }
}
