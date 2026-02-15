import { Component } from "@angular/core";
import { SharedModule } from "../../../../shared/shared-imports";
import { Category } from "../../../../shared/types/category";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { CATEGORIES_MANAGEMENT } from "../../../../shared/data/dummy";

@Component({
  selector: 'admin-common-category',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent
  ],
  template: `
      <div class="z-10 flex h-full flex-auto flex-col">
        <div class="flex flex-1 z-[2] min-w-0 h-full bg-body absolute inset-0 overflow-hidden">
          <div class="relative mx-0 border-0 w-[320px] max-w-[320px] overflow-hidden bg-transparent flex-0">
            <div class="w-full relative bg-body text-[#1F232B] min-w-full h-full overflow-y-auto flex flex-col top-0 left-0">
              <div class="relative">
                <div class="lg:min-w-0 flex flex-col max-h-full bg-body">
                  <div class="flex items-center justify-between p-4">
                    <p class="tracking-tight font-extrabold leading-none text-[24px] text-primary m-0">
                      Categories
                    </p>
                  </div>
                  <div class="navigation px-3">
                    <a 
                      class="p-2 rounded-md gap-2 w-full flex mb-1 bg-borderGray cursor-pointer relative align-middle text-[13px] font-medium leading-none min-h-8 min-w-8 text-[#1F232B]"
                      *ngFor="let category of categories"
                      [routerLink]="category.route"
                    >
                      <boo-icon [name]="category.icon" iconClass="stroke-primary"></boo-icon>
                      <div class="flex min-w-0 flex-auto flex-col items-start gap-1">
                        <p class="leading-none truncate max-w-full m-0 text-[13px] text-primary">
                          {{ category.name }}
                        </p>
                        <p class="leading-none text-[11px] truncate max-w-full m-0 text-regular">
                            {{ category.description }}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="pt-0.5 pl-0.5 flex flex-col w-full z-[9999]">
            <div 
              class="ps bg-surface relative flex flex-col flex-1 min-h-0 overscroll-contain h-screen shadow-card"
              style="border-top-left-radius: 12px; scrollbar-width: none; position: relative; overflow-y: auto;"
            >
              <div class="flex-auto px-6 py-2">
                <router-outlet></router-outlet>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
})

export class AdminCommonCategoryComponent {
  // #region Inputs, Outputs, Properties
  viewMode: 'grid' | 'table' = 'grid';
  selectedType = 'all';
  searchTerm = '';
  filterStatus = '';
  showModal = false;
  isEditMode = false;
  openMenuId: number | null = null;

  categories = CATEGORIES_MANAGEMENT;

  formData: any = {
    name: '',
    code: '',
    description: '',
    type: '',
    status: 'active',
    icon: '📋',
    color: '#3B82F6',
  };
  // #endregion

  // #region Methods
  toggleMenu(id: number): void {
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.formData = {
      name: '',
      code: '',
      description: '',
      type: this.selectedType !== 'all' ? this.selectedType : '',
      status: 'active',
      icon: '📋',
      color: '#3B82F6',
    };
    this.showModal = true;
  }

  editCategory(category: Category): void {
    this.isEditMode = true;
    this.formData = { ...category };
    this.showModal = true;
    this.openMenuId = null;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditMode = false;
    this.openMenuId = null;
  }
  // #endregion
}