import { Component, inject } from "@angular/core";
import { CommonCategoryInsuranceCompanyDrawerComponent } from "../../../../../components/layout/admin/system/common-category/insurance-company/insurance-company-drawer.component";
import { CommonCategoryInsuranceCompanyTableCardComponent } from "../../../../../components/layout/admin/system/common-category/insurance-company/insurance-company-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { InsuranceCompanyService } from "../../../../../services/admin/insurance-company.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { InsuranceCompany } from "../../../../../shared/types/support.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-insurance-company-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryInsuranceCompanyTableCardComponent,
        CommonCategoryInsuranceCompanyDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryInsuranceCompanyListComponent extends CommonCategoryListBase<InsuranceCompany> {
    constructor() {
        const service = inject(InsuranceCompanyService);
        super({
            service,
            noun: ['insurance company', 'insurance companies'],
            permissions: {
                create: Permissions.Admin.InsuranceCompanyCreate,
                update: Permissions.Admin.InsuranceCompanyUpdate,
                delete: Permissions.Admin.InsuranceCompanyDelete
            },
            itemName: item => item.name,
        });
    }
}
