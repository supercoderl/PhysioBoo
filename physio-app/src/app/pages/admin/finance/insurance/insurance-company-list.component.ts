import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooStatusBadgeComponent } from '@physioboo/ui';
import { BooTableAdminComponent } from "../../../../components/table/boo-table-admin/boo-table-admin.component";
import { ColumnDefDirective } from "../../../../shared/directives/column-def.directive";
import { SharedModule } from "../../../../shared/shared-imports";
import { PaginationData } from "../../../../shared/types/common";
import { insuranceTypeLabel } from "../../../../shared/types/insurance-company.types";
import { InsuranceCompany } from "../../../../shared/types/support.types";

/** The insurer list: name and code, contact, coverage terms and status. Everything else lives in the detail panel. */
@Component({
    selector: 'insurance-company-list',
    standalone: true,
    imports: [SharedModule, BooTableAdminComponent, ColumnDefDirective, BooStatusBadgeComponent],
    host: { class: 'block h-full min-h-0 min-w-0' },
    template: `
    <div class="h-full min-h-0 bg-surface rounded-2 border border-borderGray/60 overflow-hidden">
      <boo-table-admin
        minTableWidth="640px"
        [data]="data?.items ?? []"
        [showToolbar]="false"
        [fillEmpty]="false"
        tdClass="px-4"
        [showFooter]="true"
        [currentPage]="data?.pageNumber ?? 1"
        [pageSize]="data?.pageSize ?? 10"
        [totalItems]="data?.totalCount ?? 0"
        [loading]="loading"
        (pageChange)="pageChange.emit($event)"
      >
        <ng-template appColumnDef="insurer" headerLabel="Insurer" headerClass="text-left" width="34%" let-item>
          <div class="min-w-0 leading-tight">
            <button type="button" (click)="select.emit(item)" [attr.aria-current]="item.id === selectedId ? 'true' : null"
              class="block max-w-full truncate text-left text-sm font-semibold hover:underline cursor-pointer"
              [ngClass]="item.id === selectedId ? 'text-primary underline' : 'text-regular'" [title]="item.name">{{ item.name }}</button>
            <div class="truncate text-[11px] text-secondary">{{ item.code || 'No code' }} · {{ typeLabel(item.type) }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="contact" headerLabel="Contact" headerClass="text-left" let-item>
          <div class="min-w-0 leading-tight">
            <div class="truncate text-sm text-regular">{{ item.contactPerson || '—' }}</div>
            <div class="truncate text-[11px] text-secondary">{{ item.phone || item.email || 'No phone or email' }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="terms" headerLabel="Claims terms" headerClass="text-left" let-item>
          <div class="leading-tight">
            <div class="text-sm text-regular tabular-nums">{{ item.averageClaimSettlementTime }} day{{ item.averageClaimSettlementTime === 1 ? '' : 's' }} avg. settlement</div>
            <div class="text-[11px] text-secondary">{{ settlementModes(item) }}</div>
          </div>
        </ng-template>

        <ng-template appColumnDef="status" headerLabel="Status" headerClass="text-left" let-item>
          <boo-status-badge [label]="item.isActive ? 'Active' : 'Inactive'" [tone]="item.isActive ? 'success' : 'neutral'" dotted></boo-status-badge>
        </ng-template>
      </boo-table-admin>
    </div>
  `,
})
export class InsuranceCompanyListComponent {
    @Input() data: PaginationData<InsuranceCompany> | null = null;
    @Input() loading = false;
    @Input() selectedId: string | null = null;

    @Output() pageChange = new EventEmitter<number>();
    @Output() select = new EventEmitter<InsuranceCompany>();

    typeLabel = insuranceTypeLabel;

    settlementModes(c: InsuranceCompany): string {
        const modes = [c.cashlessFacility ? 'Cashless' : '', c.reimbursementFacility ? 'Reimbursement' : ''].filter(Boolean);
        return modes.length ? modes.join(' · ') : 'No settlement mode set';
    }
}
