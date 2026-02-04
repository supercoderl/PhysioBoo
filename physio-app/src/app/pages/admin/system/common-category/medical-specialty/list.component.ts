import { Component, OnInit } from "@angular/core";
import { SharedModule } from "../../../../../shared/shared-imports";
import { AdminContentHeaderComponent } from "../../../../../components/layout/admin/content-header/content-header.component";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { ButtonIconComponent } from "../../../../../components/button/button-icon/button-icon.component";
import { BooInputComponent } from "../../../../../components/input/boo-input/boo-input.component";
import { PaginationData } from "../../../../../shared/types/common";
import { MedicalSpecialty } from "../../../../../shared/types/medical-staff";
import { MedicalSpecialtyService } from "../../../../../services/admin/medical-specialty.service";
import { AdminMedicalSpecialtyTableCardComponent } from "../../../../../components/layout/admin/setting/common-category/medical-specialty/medical-specialty-table-card.component";
import { AdminMedicalSpecialtyDrawerComponent } from "../../../../../components/layout/admin/setting/common-category/medical-specialty/medical-specialty-drawer.component";

@Component({
    selector: 'common-category-medical-specialty-list',
    standalone: true,
    imports: [
        SharedModule,
        AdminContentHeaderComponent,
        BooButtonAdminComponent,
        BooIconComponent,
        ButtonIconComponent,
        BooInputComponent,
        AdminMedicalSpecialtyTableCardComponent,
        AdminMedicalSpecialtyDrawerComponent
    ],
    templateUrl: `./list.component.html`
})

export class CommonCategoryMedicalSpecialtyListComponent implements OnInit {
    // #region Inputs, Outputs, Properties
    paginationData: PaginationData<MedicalSpecialty[]> | null = null;
    filter = { pageNumber: 1, pageSize: 5 };
    isDrawerOpen: boolean = false;
    selectedId: string | null = null;
    // #endregion

    // #region Init (Lifecycle + Setup)
    constructor(
        private medicalSpecialtySrv: MedicalSpecialtyService
    ) { }

    ngOnInit(): void {
        this.loadMedicalSpecialties();
    }
    // #endregion

    // #region Methods
    loadMedicalSpecialties() {
        this.medicalSpecialtySrv.search({
            pageNumber: this.filter.pageNumber,
            pageSize: this.filter.pageSize
        })
            .subscribe(_res => {
                if (_res.success) {
                    this.paginationData = _res.data;
                }
            });
    }

    onPageChanged(newPage: number) {
        this.filter.pageNumber = newPage;
        this.loadMedicalSpecialties();
    }

    onOpenDrawer(id: string | null) {
        this.selectedId = id;
        this.isDrawerOpen = true;
    }

    onCloseDrawer() {
        this.isDrawerOpen = false;
        this.selectedId = null;
    }

    onSaveSuccess() {
        this.onCloseDrawer();
        this.loadMedicalSpecialties();
    }

    onDelete(id: string | null) {
        if (id) {
            this.medicalSpecialtySrv.delete(id)
                .subscribe(_res => {
                    if (_res.success) {
               
                    }
                });
        }
    }
    // #endregion
}