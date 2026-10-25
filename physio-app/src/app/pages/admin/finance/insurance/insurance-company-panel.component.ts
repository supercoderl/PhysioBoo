import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooButtonComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { SharedModule } from "../../../../shared/shared-imports";
import { InsuranceCompanyPermissions, insuranceTypeLabel, parseNetworkHospitals } from "../../../../shared/types/insurance-company.types";
import { InsuranceProviderNode } from "../../../../shared/types/insurance-claims.types";
import { InsuranceCompany } from "../../../../shared/types/support.types";

/** Key facts first (status, contact, settlement), secondary detail (documents, network, terms) below. */
@Component({
    selector: 'insurance-company-panel',
    standalone: true,
    imports: [SharedModule, BooButtonComponent, BooStatusBadgeComponent],
    host: { class: 'block' },
    template: `
    <section class="bg-surface rounded-2 border border-borderGray/60 flex flex-col h-full min-h-0" aria-labelledby="insurer-panel-title">
      <ng-container *ngIf="company as c; else idle">
        <header class="flex-none px-5 pt-5 pb-4 border-b border-gray-100">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 id="insurer-panel-title" class="text-lg font-bold text-regular leading-tight m-0 break-words">{{ c.name }}</h2>
              <p class="text-xs text-secondary mt-1 mb-0">{{ c.code || 'No code' }} · {{ typeLabel(c.type) }} insurance · added {{ c.createdAt | date:'mediumDate' }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <boo-status-badge [label]="c.isActive ? 'Active' : 'Inactive'" [tone]="c.isActive ? 'success' : 'neutral'" dotted></boo-status-badge>
              <button *ngIf="embedded" type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" (click)="close.emit()" aria-label="Close insurer details">
                <physio-icon name="x" [size]="18"></physio-icon>
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 mt-4" *ngIf="permissions.update || permissions.delete">
            <button *ngIf="permissions.update" type="button" boo-button variant="secondary" size="sm" [disabled]="busy" (click)="edit.emit(c)">
              <physio-icon name="pencil" [size]="16"></physio-icon>Edit
            </button>
            <button *ngIf="permissions.update" type="button" boo-button variant="outline" size="sm" [disabled]="busy" [loading]="busy" (click)="toggleActive.emit(c)">
              {{ c.isActive ? 'Deactivate' : 'Activate' }}
            </button>
            <button *ngIf="permissions.delete" type="button" boo-button variant="ghost" size="sm" class="!text-danger" [disabled]="busy" (click)="remove.emit(c)">
              <physio-icon name="trash" [size]="16"></physio-icon>Delete
            </button>
          </div>
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5" custom-scrollbar>
          <section *ngIf="claimNode || claimsUnavailable" aria-label="Claims">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary m-0 mb-2">Claims</h3>
            <div *ngIf="claimNode as n" class="rounded-1.5 bg-gray-50 px-3 py-3 flex items-center justify-between gap-3">
              <dl class="m-0 flex gap-6">
                <div><dt class="text-[11px] font-medium text-secondary">Total</dt><dd class="m-0 text-base font-bold text-regular tabular-nums">{{ n.claimCount }}</dd></div>
                <div><dt class="text-[11px] font-medium text-secondary">Pending</dt><dd class="m-0 text-base font-bold text-regular tabular-nums">{{ n.pendingCount }}</dd></div>
              </dl>
              <button *ngIf="canViewClaims" type="button" boo-button variant="secondary" size="sm" (click)="viewClaims.emit(c)">View claims</button>
            </div>
            <p *ngIf="!claimNode && claimsUnavailable" class="m-0 text-sm text-secondary">
              {{ c.isActive ? 'Claim counts could not be loaded.' : 'Claim counts are shown for active insurers only.' }}
            </p>
          </section>

          <section aria-label="Contact">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary m-0 mb-2">Contact</h3>
            <dl class="m-0 grid grid-cols-[7rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              <dt class="text-secondary">Contact person</dt><dd class="m-0 text-regular break-words">{{ c.contactPerson || '—' }}</dd>
              <dt class="text-secondary">Phone</dt><dd class="m-0 text-regular break-words">{{ c.phone || '—' }}</dd>
              <dt class="text-secondary">Email</dt>
              <dd class="m-0 break-words"><a *ngIf="c.email; else none" class="text-primary hover:underline" [href]="'mailto:' + c.email">{{ c.email }}</a></dd>
              <dt class="text-secondary">Website</dt>
              <dd class="m-0 break-words"><a *ngIf="c.website; else none" class="text-primary hover:underline" [href]="c.website" target="_blank" rel="noopener noreferrer">{{ c.website }}</a></dd>
              <dt class="text-secondary">Address</dt><dd class="m-0 text-regular break-words">{{ c.address || '—' }}</dd>
            </dl>
          </section>

          <section aria-label="Settlement and coverage">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary m-0 mb-2">Settlement and coverage</h3>
            <dl class="m-0 grid grid-cols-2 gap-2">
              <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                <dt class="text-[11px] font-medium text-secondary">Settlement modes</dt>
                <dd class="m-0 mt-0.5 text-sm font-semibold text-regular">{{ modes(c) }}</dd>
              </div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                <dt class="text-[11px] font-medium text-secondary">Avg. settlement time</dt>
                <dd class="m-0 mt-0.5 text-sm font-semibold text-regular tabular-nums">{{ c.averageClaimSettlementTime }} day{{ c.averageClaimSettlementTime === 1 ? '' : 's' }}</dd>
              </div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                <dt class="text-[11px] font-medium text-secondary">Settlement ratio</dt>
                <dd class="m-0 mt-0.5 text-sm font-semibold text-regular tabular-nums">{{ c.claimSettlementRatio === null ? '—' : (c.claimSettlementRatio | number:'1.0-2') + '%' }}</dd>
              </div>
              <div class="rounded-1.5 bg-gray-50 px-3 py-2.5">
                <dt class="text-[11px] font-medium text-secondary">Max. coverage</dt>
                <dd class="m-0 mt-0.5 text-sm font-semibold text-regular tabular-nums">{{ c.maximumCoverageAmount === null ? '—' : (c.maximumCoverageAmount | number:'1.0-2') }}</dd>
              </div>
            </dl>
          </section>

          <section aria-label="Required documents">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary m-0 mb-2">Required documents</h3>
            <ul *ngIf="c.requiredDocuments?.length; else none" class="m-0 p-0 list-none flex flex-wrap gap-1.5">
              <li *ngFor="let d of c.requiredDocuments" class="px-2 py-1 rounded-1.5 bg-gray-100 text-xs text-regular">{{ d }}</li>
            </ul>
          </section>

          <section aria-label="Network hospitals">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary m-0 mb-2">Network hospitals</h3>
            <ng-container *ngIf="network(c) as n">
              <ul *ngIf="n.editable && n.names.length; else rawOrNone" class="m-0 pl-5 text-sm text-regular space-y-0.5">
                <li *ngFor="let h of n.names">{{ h }}</li>
              </ul>
              <ng-template #rawOrNone>
                <pre *ngIf="!n.editable" class="m-0 p-3 rounded-1.5 bg-gray-50 text-xs text-regular whitespace-pre-wrap break-words">{{ c.networkHospitals }}</pre>
                <ng-container *ngIf="n.editable"><ng-container *ngTemplateOutlet="none"></ng-container></ng-container>
              </ng-template>
            </ng-container>
          </section>

          <section aria-label="Terms and conditions">
            <h3 class="text-xs font-bold uppercase tracking-wider text-secondary m-0 mb-2">Terms and conditions</h3>
            <p *ngIf="c.termAndConditions; else none" class="m-0 text-sm text-regular whitespace-pre-wrap break-words">{{ c.termAndConditions }}</p>
          </section>
        </div>
      </ng-container>

      <ng-template #idle>
        <div class="flex-1 flex flex-col items-center justify-center text-center gap-2 px-6 py-16">
          <physio-icon name="building-2" [size]="28" class="text-gray-400"></physio-icon>
          <h2 id="insurer-panel-title" class="text-base font-semibold text-regular m-0">Select an insurer</h2>
          <p class="text-sm text-secondary m-0 max-w-xs">Contact details, settlement terms and required documents appear here.</p>
        </div>
      </ng-template>

      <ng-template #none><span class="text-sm text-secondary">—</span></ng-template>
    </section>
  `,
})
export class InsuranceCompanyPanelComponent {
    @Input() company: InsuranceCompany | null = null;
    @Input() permissions: InsuranceCompanyPermissions = { create: false, update: false, delete: false };
    /** Claim totals for this insurer, from the providers tree. Null when unavailable. */
    @Input() claimNode: InsuranceProviderNode | null = null;
    /** The user may read claims, so counts are expected to load. */
    @Input() canViewClaims = false;
    @Input() claimsUnavailable = false;
    @Input() embedded = false;
    /** A mutation is in flight: the actions are disabled. */
    @Input() busy = false;

    @Output() edit = new EventEmitter<InsuranceCompany>();
    @Output() toggleActive = new EventEmitter<InsuranceCompany>();
    @Output() remove = new EventEmitter<InsuranceCompany>();
    @Output() viewClaims = new EventEmitter<InsuranceCompany>();
    @Output() close = new EventEmitter<void>();

    typeLabel = insuranceTypeLabel;
    network = (c: InsuranceCompany) => parseNetworkHospitals(c.networkHospitals);

    modes(c: InsuranceCompany): string {
        const modes = [c.cashlessFacility ? 'Cashless' : '', c.reimbursementFacility ? 'Reimbursement' : ''].filter(Boolean);
        return modes.length ? modes.join(' · ') : 'None set';
    }
}
