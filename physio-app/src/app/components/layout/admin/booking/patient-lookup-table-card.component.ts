import { Component } from "@angular/core";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { ButtonIconComponent } from "../../../button/button-icon/button-icon.component";
import { BooTableAdminComponent } from "../../../table/boo-table-admin/boo-table-admin.component";
import { Patient } from "../../../../shared/types/patient";

@Component({
    selector: 'admin-patient-lookup-table-card',
    standalone: true,
    imports: [
        SharedModule,
        BooTableAdminComponent,
        ColumnDefDirective,
        ButtonIconComponent
    ],
    template: `
    <div class="bg-white rounded-[6px] border border-gray-200 h-full">
      <boo-table-admin 
        [data]="getPaginatedData()" 
        tdClass="px-4 py-3"
        [showFooter]="true" 
        [currentPage]="currentPage"
        [pageSize]="pageSize"
        [totalItems]="patients.length"
        (pageChange)="onPageChange($event)"
      >
        <ng-template appColumnDef="id" headerLabel="Patient ID" headerClass="text-left" let-item>
          <div>
            <div class="text-gray-500">{{item.id}}</div>
          </div>
        </ng-template>
        
        <ng-template appColumnDef="name" headerLabel="Name" headerClass="text-left" let-item>
          <div class="flex items-center gap-3">
            <div>
              <div class="font-semibold text-gray-900">{{ item.name }}</div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="age" headerLabel="Age" headerClass="text-left" let-item>
          <div class="flex items-center gap-3">
            <div>
              <div class="font-semibold text-gray-900">{{ item.age }}</div>
            </div>
          </div>
        </ng-template>

        <ng-template appColumnDef="gender" headerLabel="Gender" headerClass="text-left" let-item>
          <div>
            <div class="font-semibold text-gray-900">{{item.gender}}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="phone" headerLabel="Phone" headerClass="text-left" let-item>
          <div>
            <div class="font-semibold text-gray-900">{{item.phone}}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="lastVisit" headerLabel="Last Visit" headerClass="text-left" let-item>
          <div>
            <div class="font-semibold text-gray-900">14-11-2025</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <span class="inline-block px-2 py-1 rounded-md text-xs font-medium" 
                [style.color]="'#5e7023ff'"
                [style.background-color]="'#5e7023ff' + '15'">
            Active
          </span>
        </ng-template>

        <ng-template appColumnDef="actions" let-item cellClass="text-right">
          <div class="flex items-center justify-end gap-2">
            <button-icon 
              [icon]="{ name: 'circle-x' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
            >
            </button-icon>
            <button-icon
              [icon]="{ name: 'check' }"
              buttonClass="!bg-[#EEF2F7] !border-0 !px-2"
            >
            </button-icon>
          </div>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
    styles: [`
    :host ::ng-deep {
      .pi {
        font-size: 0.875rem;
      }
    }
  `]
})
export class AdminBookingTableCardComponent {
    // #region Inputs, Outputs, Properties
    currentPage: number = 1;
    pageSize: number = 5;
    patients: Patient[] = [
        {
            id: 12345,
            name: 'John Smith',
            dateOfBirth: 'March 15, 1978',
            age: 45,
            gender: 'Male',
            bloodType: 'O+',
            phone: '+1 (555) 123-4567',
            email: 'john.smith@email.com',
            address: '123 Main Street, New York, NY 10001',
            emergencyContact: 'Jane Smith (Wife)',
            emergencyPhone: '+1 (555) 987-6543',
            allergies: ['Penicillin', 'Aspirin', 'Shellfish'],
            chronicConditions: ['Hypertension', 'Type 2 Diabetes']
        },
    ];

    getPaginatedData(): Patient[] {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        return this.patients.slice(startIndex, endIndex);
    }
    // #endregion

    // #region Methods
    onPageChange(page: number): void {
        this.currentPage = page;
    }
    // #endregion
}