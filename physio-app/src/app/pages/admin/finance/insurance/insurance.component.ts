import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "../../../../services/auth/auth.service";
import { Permissions } from "../../../../shared/constants/permission.constant";
import { SharedModule } from "../../../../shared/shared-imports";
import { InsuranceCompany } from "../../../../shared/types/support.types";
import { InsuranceClaimsWorkspaceComponent } from "./insurance-claims-workspace.component";
import { InsuranceCompaniesComponent } from "./insurance-companies.component";

type InsuranceView = 'insurers' | 'claims';

/**
 * Insurance hub. "Insurers" manages the companies the hospital works with; "Claims" is the claim processing
 * workspace. The claims view needs its own permission (finance:insurance-claim:read), which the route does not
 * guarantee, so it is only offered to users who have it.
 */
@Component({
    selector: 'admin-insurance',
    standalone: true,
    imports: [SharedModule, InsuranceCompaniesComponent, InsuranceClaimsWorkspaceComponent],
    template: `
    <main class="flex flex-1 min-h-0 flex-col gap-5 pb-5">
      <header class="min-w-0 shrink-0">
        <h1 class="m-0 text-xl leading-7 font-semibold tracking-tight text-regular">Insurance</h1>
        <p class="text-sm text-secondary mt-1 mb-0 max-w-2xl">
          Maintain the insurers the hospital works with — contacts, settlement terms and required documents.
          <ng-container *ngIf="canReadClaims">Switch to Claims to process claims against them.</ng-container>
        </p>
      </header>

      <div *ngIf="canReadClaims" role="tablist" aria-label="Insurance sections" class="inline-flex shrink-0 self-start gap-1 bg-gray-100 rounded-2 p-1" (keydown.arrowright)="move(1)" (keydown.arrowleft)="move(-1)">
        <button type="button" role="tab" id="insurance-tab-insurers" aria-controls="insurance-panel-insurers"
          [attr.aria-selected]="view() === 'insurers'" [attr.tabindex]="view() === 'insurers' ? 0 : -1" (click)="setView('insurers')"
          class="px-4 h-9 rounded-1.5 text-sm font-semibold cursor-pointer transition-colors"
          [ngClass]="view() === 'insurers' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">Insurers</button>
        <button type="button" role="tab" id="insurance-tab-claims" aria-controls="insurance-panel-claims"
          [attr.aria-selected]="view() === 'claims'" [attr.tabindex]="view() === 'claims' ? 0 : -1" (click)="setView('claims')"
          class="px-4 h-9 rounded-1.5 text-sm font-semibold cursor-pointer transition-colors"
          [ngClass]="view() === 'claims' ? 'bg-surface text-regular shadow-sm' : 'text-secondary hover:text-regular'">Claims</button>
      </div>

      <section *ngIf="view() === 'insurers'" id="insurance-panel-insurers" role="tabpanel" class="flex flex-1 min-h-[34rem] flex-col" aria-labelledby="insurance-tab-insurers">
        <insurance-companies class="flex-1 min-h-0" (viewClaims)="openClaims($event)"></insurance-companies>
      </section>

      <section *ngIf="view() === 'claims' && canReadClaims" id="insurance-panel-claims" role="tabpanel" aria-labelledby="insurance-tab-claims"
        class="flex-1 min-h-[34rem] rounded-2 border border-borderGray/60 overflow-hidden">
        <insurance-claims-workspace [providerId]="claimsProviderId()"></insurance-claims-workspace>
      </section>
    </main>
  `,
})
export class AdminInsuranceComponent implements OnInit {
    private readonly authSrv = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    readonly canReadClaims = this.authSrv.hasPermission(Permissions.Finance.InsuranceClaimRead);

    view = signal<InsuranceView>('insurers');
    /** Insurer handed over from the Insurers view, to scope the claims queue. */
    claimsProviderId = signal<string | null>(null);

    ngOnInit(): void {
        if (this.canReadClaims && this.route.snapshot.queryParamMap.get('view') === 'claims') this.view.set('claims');
    }

    setView(view: InsuranceView): void {
        if (view === 'claims' && !this.canReadClaims) return;
        if (view === 'insurers') this.claimsProviderId.set(null);
        this.view.set(view);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { view: view === 'claims' ? 'claims' : null },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }

    openClaims(company: InsuranceCompany): void {
        this.claimsProviderId.set(company.id);
        this.setView('claims');
    }

    move(step: 1 | -1): void {
        if (!this.canReadClaims) return;
        this.setView(step === 1 ? 'claims' : 'insurers');
        setTimeout(() => document.getElementById(`insurance-tab-${this.view()}`)?.focus());
    }
}
