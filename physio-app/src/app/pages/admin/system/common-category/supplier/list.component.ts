import { Component, inject } from "@angular/core";
import { CommonCategorySupplierDrawerComponent } from "../../../../../components/layout/admin/system/common-category/supplier/supplier-drawer.component";
import { CommonCategorySupplierTableCardComponent } from "../../../../../components/layout/admin/system/common-category/supplier/supplier-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { SupplierService } from "../../../../../services/admin/supplier.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Supplier } from "../../../../../shared/types/support.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-supplier-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategorySupplierTableCardComponent,
        CommonCategorySupplierDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategorySupplierListComponent extends CommonCategoryListBase<Supplier> {
    constructor() {
        const service = inject(SupplierService);
        super({
            service,
            noun: ['supplier', 'suppliers'],
            permissions: {
                create: Permissions.Pharmacy.SupplierCreate,
                update: Permissions.Pharmacy.SupplierUpdate,
                delete: Permissions.Pharmacy.SupplierDelete
            },
            itemName: item => item.supplierName,
        });
    }
}
