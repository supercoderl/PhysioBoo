import { Component, OnInit, inject, signal } from '@angular/core';
import { BooButtonComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { filter, switchMap, take } from 'rxjs';
import { AuthService } from '../../../../services/auth/auth.service';
import { SharedModule } from '../../../../shared/shared-imports';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    SharedModule,
    BooButtonComponent,
    BooErrorStateComponent,
    BooStatusBadgeComponent
  ],
  template: `
    <div class="flex flex-auto flex-col min-h-0 overflow-y-auto bg-[#F6F7F8]" custom-scrollbar>
      <ng-container *ngIf="(userInfo$ | async) as user; else noUser">
        <div class="bg-surface border-b border-solid border-[#EFE3E7]">
          <div class="container">
            <div class="flex w-full flex-col">
              <div
                class="h-40 w-full lg:h-60"
                style="background: linear-gradient(90.08deg, #E11D48 0.09%, #06aed4 70.28%)"
                aria-hidden="true"
              ></div>
              <div class="mx-auto flex w-full max-w-7xl shrink-0 flex-col items-center gap-4 px-8 pb-6 lg:flex-row lg:items-end">
                <div
                  class="-mt-16 border-4 border-solid w-32 h-32 shrink-0 relative overflow-hidden rounded-full border-[#c4c4c4] bg-surface"
                >
                  <img
                    class="w-full h-full object-cover"
                    [alt]="displayName(user)"
                    [appSrc]="user.avatarUrl"
                  />
                </div>
                <div class="flex flex-col items-center lg:items-start lg:flex-1 min-w-0">
                  <h1 class="font-bold leading-tight text-[20px] m-0 truncate max-w-full">
                    {{ displayName(user) }}
                  </h1>
                  <p class="m-0 text-[13px] leading-[1.5] text-[#71606A] truncate max-w-full">{{ user.email }}</p>
                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <boo-status-badge
                      [label]="user.isVerified ? 'Verified' : 'Unverified'"
                      [tone]="user.isVerified ? 'success' : 'warning'"
                      dotted
                    ></boo-status-badge>
                    <boo-status-badge
                      *ngFor="let role of roles$ | async"
                      [label]="role"
                      tone="primary"
                    ></boo-status-badge>
                  </div>
                </div>
                <a boo-button variant="primary" size="sm" routerLink="/admin/system/settings/account">
                  Edit account
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="container">
          <div class="mx-auto w-full max-w-7xl p-4 sm:p-8">
            <section class="bg-surface rounded-[12px] shadow-xs p-6" aria-labelledby="profile-contact-heading">
              <h2 id="profile-contact-heading" class="font-semibold text-lg m-0 mb-4">Contact</h2>
              <dl class="grid gap-4 sm:grid-cols-2 m-0">
                <div>
                  <dt class="text-xs font-medium text-[#71606A]">Email</dt>
                  <dd class="m-0 mt-1 text-[14px] break-all">{{ user.email }}</dd>
                </div>
                <div>
                  <dt class="text-xs font-medium text-[#71606A]">Phone</dt>
                  <dd class="m-0 mt-1 text-[14px]">{{ user.phone || '—' }}</dd>
                </div>
              </dl>
              <p class="m-0 mt-4 text-[13px] text-[#71606A]">
                Names, date of birth, emergency contacts and other personal details are managed in your account settings.
              </p>
            </section>
          </div>
        </div>
      </ng-container>

      <ng-template #noUser>
        <div class="container">
          <div class="mx-auto w-full max-w-7xl p-4 sm:p-8">
            <boo-error-state
              *ngIf="loadFailed(); else loading"
              title="Couldn't load your profile"
              description="Check your connection and try again."
              (retry)="load()"
            ></boo-error-state>
            <ng-template #loading>
              <div class="animate-pulse flex flex-col gap-4" role="status" aria-label="Loading your profile">
                <div class="h-40 rounded-[12px] bg-[#EFE3E7]"></div>
                <div class="h-24 rounded-[12px] bg-[#EFE3E7]"></div>
              </div>
            </ng-template>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  private authSrv = inject(AuthService);

  userInfo$ = this.authSrv.userInfo$;
  roles$ = this.authSrv.role$;
  loadFailed = signal(false);
  // #endregion

  // #region Init (Lifecycle + Setup)
  ngOnInit(): void {
    this.load();
  }
  // #endregion

  // #region Actions
  /** The shell normally has the user already; this covers a direct page load or a failed earlier fetch. */
  load(): void {
    this.loadFailed.set(false);
    this.userInfo$.pipe(
      take(1),
      filter(user => !user),
      switchMap(() => this.authSrv.getProfile())
    ).subscribe({
      error: () => this.loadFailed.set(true)
    });
  }

  displayName(user: { firstName: string; lastName: string; email: string }): string {
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  }
  // #endregion
}
