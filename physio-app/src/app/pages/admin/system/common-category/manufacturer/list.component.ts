import { Component, inject } from "@angular/core";
import { CommonCategoryManufacturerDrawerComponent } from "../../../../../components/layout/admin/system/common-category/manufacturer/manufacturer-drawer.component";
import { CommonCategoryManufacturerTableCardComponent } from "../../../../../components/layout/admin/system/common-category/manufacturer/manufacturer-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { ManufacturerService } from "../../../../../services/admin/manufacturer.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Manufacturer } from "../../../../../shared/types/support.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-manufacturer-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryManufacturerTableCardComponent,
        CommonCategoryManufacturerDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryManufacturerListComponent extends CommonCategoryListBase<Manufacturer> {
    constructor() {
        const service = inject(ManufacturerService);
        super({
            service,
            noun: ['manufacturer', 'manufacturers'],
            permissions: {
                create: Permissions.Pharmacy.ManufacturerCreate,
                update: Permissions.Pharmacy.ManufacturerUpdate,
                delete: Permissions.Pharmacy.ManufacturerDelete
            },
            itemName: item => item.name,
        });
    }
}
