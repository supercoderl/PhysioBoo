import { Component, OnInit, inject } from "@angular/core";
import { CommonCategoryMedicalSpecialtyDrawerComponent } from "../../../../../components/layout/admin/system/common-category/medical-specialty/medical-specialty-drawer.component";
import { CommonCategoryMedicalSpecialtyTableCardComponent } from "../../../../../components/layout/admin/system/common-category/medical-specialty/medical-specialty-table-card.component";
import { CommonCategoryPageComponent } from "../../../../../components/layout/admin/system/common-category/shared/category-page.component";
import { MedicalSpecialtyService } from "../../../../../services/admin/medical-specialty.service";
import { Permissions } from "../../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../../shared/shared-imports";
import { MedicalSpecialty } from "../../../../../shared/types/medical-staff.types";
import { CommonCategoryListBase } from "../common-category-list.base";

@Component({
    selector: 'common-category-medical-specialty-list',
    standalone: true,
    imports: [
        SharedModule,
        CommonCategoryPageComponent,
        CommonCategoryMedicalSpecialtyTableCardComponent,
        CommonCategoryMedicalSpecialtyDrawerComponent,
    ],
    templateUrl: './list.component.html',
    host: { class: 'flex flex-1 min-h-0 min-w-0 flex-col' }
})
export class CommonCategoryMedicalSpecialtyListComponent extends CommonCategoryListBase<MedicalSpecialty> implements OnInit {
    /** Every specialty by id, for the parent column and the drawer's parent picker. */
    parentNames: Record<string, string> = {};
    parentOptions: { label: string; value: string }[] = [];

    private readonly parentLookupSrv = inject(MedicalSpecialtyService);

    constructor() {
        const service = inject(MedicalSpecialtyService);
        super({
            service,
            noun: ['medical specialty', 'medical specialties'],
            permissions: {
                create: Permissions.Admin.MedicalSpecialtyCreate,
                update: Permissions.Admin.MedicalSpecialtyUpdate,
                delete: Permissions.Admin.MedicalSpecialtyDelete
            },
            itemName: item => item.name,
            filters: [
                { key: 'isSurgical', label: 'Classification', type: 'boolean', value: null, trueLabel: 'Surgical', falseLabel: 'Diagnostic' },
            ]
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
