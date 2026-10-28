import { Component, OnInit, inject } from "@angular/core";
import { CommonCategoryMedicineCategoryDrawerComponent } from "../../../../../components/layout/admin/system/common-category/medicine-category/medicine-category-drawer.component";
import { CommonCategoryMedicineCategoryTableCardComponent } from "../../../../../components/layout/admin/system/common-category/medicine-category/medicine-category-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { MedicineCategoryService } from "../../../../../services/admin/medicine-category.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MedicineCategory } from "../../../../../shared/types/clinical.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-medicine-category-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryMedicineCategoryTableCardComponent,
        CommonCategoryMedicineCategoryDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryMedicineCategoryListComponent extends CommonCategoryListBase<MedicineCategory> implements OnInit {
    /** Every category by id, for the parent column and the drawer's parent picker. */
    parentNames: Record<string, string> = {};
    parentOptions: { label: string; value: string }[] = [];

    private readonly parentLookupSrv = inject(MedicineCategoryService);

    constructor() {
        const service = inject(MedicineCategoryService);
        super({
            service,
            noun: ['medicine category', 'medicine categories'],
            permissions: {
                create: Permissions.Pharmacy.MedicineCategoryCreate,
                update: Permissions.Pharmacy.MedicineCategoryUpdate,
                delete: Permissions.Pharmacy.MedicineCategoryDelete
            },
            itemName: item => item.name,
        });
    }

    ngOnInit(): void {
        this.loadParents();
    }

    override onSaveSuccess(): void {
        super.onSaveSuccess();
        this.loadParents();
    }

    /** The search endpoint is the only list API; one large page sorted by name covers the catalog. */
    private loadParents(): void {
        this.parentLookupSrv.search({ pageNumber: 1, pageSize: 500, search: '', sort: '+name', filter: { start: '', end: '' } })
            .subscribe({
                next: res => {
                    const items = res.success ? res.data?.items ?? [] : [];
                    this.parentNames = Object.fromEntries(items.map(x => [x.id, x.name]));
                    this.parentOptions = items.map(x => ({ label: x.name, value: x.id }));
                },
                // Without the lookup the parent column reads "Unknown"; the list itself still works.
                error: () => undefined
            });
    }
}
