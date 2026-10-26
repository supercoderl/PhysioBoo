import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "../../../../services/auth/auth.service";
import { CATEGORIES_MANAGEMENT } from "../../../../shared/data/dummy";
import { SharedModule } from "../../../../shared/shared-imports";
import { canOpenNavLink, childRoutePermissions } from "../../../../shared/utils/route-permission.utils";

@Component({
  selector: 'admin-common-category',
  standalone: true,
  imports: [
    SharedModule,
  ],
  template: `
      <div class="flex flex-1 min-h-0 flex-col">
        <div class="flex flex-1 min-h-0 min-w-0 bg-body overflow-hidden">
          <div class="relative mx-0 border-0 w-[280px] max-w-[280px] shrink-0 overflow-hidden bg-transparent flex-0">
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
                      class="p-2 rounded-md gap-2 w-full flex mb-3 cursor-pointer relative align-middle text-[13px] font-medium leading-none min-h-8 min-w-8 text-[#1F232B] transition-all duration-300 hover:scale-105"
                      *ngFor="let category of categories"
                      [routerLink]="category.route"
                      routerLinkActive="active" 
                      #rla="routerLinkActive" 
                      [class.bg-[#0000000d]]="rla.isActive"
                    >
                      <physio-icon 
                        [name]="category.icon" 
                      ></physio-icon>
                      <div class="flex min-w-0 flex-auto flex-col items-start gap-1">
                        <p 
                          class="leading-none truncate max-w-full m-0 text-[13px] text-primary"
                        >
                          {{ category.name }}
                        </p>
                        <p 
                          class="leading-none text-[11px] truncate max-w-full m-0 text-regular"
                        >
                          {{ category.description }}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="pt-0.5 pl-0.5 flex flex-col flex-1 min-h-0 min-w-0 w-full z-[9999]">
            <div 
              class="ps bg-surface relative flex flex-col flex-1 min-h-0 overscroll-contain h-full shadow-card boo-scrollbar"
              style="border-top-left-radius: 12px; position: relative; overflow-y: auto;"
            >
              <div class="flex-1 min-h-0 px-6 py-2 flex flex-col">
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
  private readonly requiredPermissions = childRoutePermissions(inject(ActivatedRoute));
  private readonly authSrv = inject(AuthService);

  /** Only the categories the signed-in user is allowed to open. */
  get categories() {
    return CATEGORIES_MANAGEMENT.filter(c =>
      canOpenNavLink(c.route, this.requiredPermissions, code => this.authSrv.hasPermission(code)));
  }
  // #endregion
}
