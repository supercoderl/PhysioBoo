import { Component, inject } from "@angular/core";
import { CommonCategoryDepartmentDrawerComponent } from "../../../../../components/layout/admin/system/common-category/department/department-drawer.component";
import { CommonCategoryDepartmentTableCardComponent } from "../../../../../components/layout/admin/system/common-category/department/department-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { DepartmentService } from "../../../../../services/admin/department.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Department } from "../../../../../shared/types/operation.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-department-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryDepartmentTableCardComponent,
        CommonCategoryDepartmentDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryDepartmentListComponent extends CommonCategoryListBase<Department> {
    constructor() {
        const service = inject(DepartmentService);
        super({
            service,
            noun: ['department', 'departments'],
            permissions: {
                create: Permissions.Admin.DepartmentCreate,
                update: Permissions.Admin.DepartmentUpdate,
                delete: Permissions.Admin.DepartmentDelete
            },
            itemName: item => item.name,
        });
    }
}
