import { Component, OnInit, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { BooEmptyStateComponent, BooErrorStateComponent } from '@physioboo/ui';
import { UserService } from '../../../services/admin/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { SharedModule } from '../../../shared/shared-imports';
import { MyAccount } from '../../../shared/types/account.types';

interface DetailRow {
    label: string;
    value: string | null;
}

/**
 * Patient landing page. Shows only what the signed-in user's own endpoints return
 * (`/api/users/me`, `/me/account`, `/me/sessions`); nothing clinical is invented.
 */
@Component({
    selector: 'patient-overview',
    standalone: true,
    imports: [SharedModule, BooEmptyStateComponent, BooErrorStateComponent],
    template: `
        <div class="py-6 flex flex-col gap-6">
            <header class="flex flex-col gap-2">
                <ng-container *ngIf="userInfo$ | async as user">
                    <div class="flex flex-wrap items-center gap-2">
                        <h1 class="tracking-tight font-bold leading-tight text-[22px] m-0">
                            Hello{{ user.firstName ? ', ' + user.firstName : '' }}
                        </h1>
                        <span
                            *ngIf="user.isVerified"
                            class="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-flex items-center gap-1"
                        >
                            <physio-icon name="badge-check" class="w-3 h-3" />
                            Verified
                        </span>
                    </div>
                    <p class="text-sm text-secondary m-0">Your PhysioBoo account at a glance.</p>

                    <div
                        *ngIf="!user.isVerified"
                        class="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                        role="status"
                    >
                        <physio-icon name="warning-circle" [size]="18" class="shrink-0" />
                        <span class="flex-1 min-w-[200px]">Your email address isn't verified yet.</span>
                        <a routerLink="/auth/verify-required" class="font-semibold underline underline-offset-2">Verify now</a>
                    </div>
                </ng-container>
            </header>

            <div *ngIf="loading()" class="grid gap-4 md:grid-cols-2" aria-hidden="true">
                <div class="h-56 rounded-lg bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
                <div class="h-56 rounded-lg bg-gray-200 animate-pulse motion-reduce:animate-none"></div>
            </div>

            <section *ngIf="!loading() && failed()" class="bg-surface rounded-lg border border-gray-200">
                <boo-error-state
                    title="We couldn't load your account"
                    description="Check your connection and try again."
                    (retry)="load()"
                />
            </section>

            <div *ngIf="!loading() && !failed()" class="grid gap-4 md:grid-cols-2">
                <section class="bg-surface rounded-lg border border-gray-200 p-5 flex flex-col" aria-labelledby="patient-details-title">
                    <div class="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h2 id="patient-details-title" class="text-base font-semibold m-0">Your details</h2>
                            <p class="text-xs text-secondary mt-1 mb-0" *ngIf="missingCount() > 0">
                                {{ missingCount() }} {{ missingCount() === 1 ? 'detail is' : 'details are' }} missing
                            </p>
                        </div>
                        <a
                            routerLink="/patient/profile"
                            class="inline-flex items-center gap-1 text-xs15 font-semibold text-primary hover:opacity-80 shrink-0"
                        >
                            Edit profile
                            <physio-icon name="chevron-right" [size]="14" />
                        </a>
                    </div>
                    <dl class="m-0 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        <div *ngFor="let row of details()" class="min-w-0">
                            <dt class="text-xs text-secondary">{{ row.label }}</dt>
                            <dd class="m-0 text-sm font-medium truncate" [class.text-secondary]="!row.value" [class.italic]="!row.value">
                                {{ row.value || 'Not provided' }}
                            </dd>
                        </div>
                    </dl>
                </section>

                <div class="flex flex-col gap-4">
                    <section class="bg-surface rounded-lg border border-gray-200 p-5" aria-labelledby="patient-security-title">
                        <div class="flex items-start justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <span class="w-10 h-10 rounded-1.5 bg-primary/5 flex items-center justify-center shrink-0">
                                    <physio-icon name="smartphone" [size]="20" class="text-primary" />
                                </span>
                                <div>
                                    <h2 id="patient-security-title" class="text-base font-semibold m-0">Signed-in devices</h2>
                                    <p class="text-sm text-secondary m-0" *ngIf="sessionCount() !== null">
                                        {{ sessionCount() }} active {{ sessionCount() === 1 ? 'session' : 'sessions' }}
                                    </p>
                                    <p class="text-sm text-secondary m-0" *ngIf="sessionCount() === null">Unavailable right now</p>
                                </div>
                            </div>
                            <a
                                routerLink="/patient/security"
                                class="inline-flex items-center gap-1 text-xs15 font-semibold text-primary hover:opacity-80 shrink-0"
                            >
                                Manage
                                <physio-icon name="chevron-right" [size]="14" />
                            </a>
                        </div>
                    </section>

                    <section class="bg-surface rounded-lg border border-gray-200" aria-label="Appointments">
                        <boo-empty-state
                            icon="calendar-clock"
                            title="Online appointments aren't available yet"
                            description="Your visits are managed by the clinic. Contact us to book or check an appointment."
                        >
                            <a
                                routerLink="/contact"
                                class="inline-flex items-center gap-1.5 text-xs15 font-semibold text-primary hover:opacity-80"
                            >
                                <physio-icon name="headset" [size]="14" />
                                Contact the clinic
                            </a>
                        </boo-empty-state>
                    </section>
                </div>
            </div>
        </div>
    `
})
export class PatientOverviewComponent implements OnInit {
    private authSrv = inject(AuthService);
    private userSrv = inject(UserService);

    userInfo$ = this.authSrv.userInfo$;
    loading = signal(false);
    failed = signal(false);
    details = signal<DetailRow[]>([]);
    missingCount = signal(0);
    sessionCount = signal<number | null>(null);

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading.set(true);
        this.failed.set(false);

        forkJoin({
            account: this.userSrv.getMyAccount(),
            // The device count is secondary: a failure here must not hide the account details.
            sessions: this.userSrv.getSessions().pipe(catchError(() => of(null))),
        }).pipe(
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: ({ account, sessions }) => {
                if (!account.success || !account.data) {
                    this.failed.set(true);
                    return;
                }
                this.fill(account.data);
                this.sessionCount.set(sessions?.success ? sessions.data.length : null);
            },
            error: () => this.failed.set(true)
        });
    }

    private fill(a: MyAccount): void {
        const rows: DetailRow[] = [
            { label: 'Phone', value: a.phone || null },
            { label: 'Date of birth', value: a.dateOfBirth ? new Date(a.dateOfBirth).toLocaleDateString() : null },
            { label: 'Gender', value: this.humanize(a.gender) },
            { label: 'Blood group', value: this.bloodGroup(a.bloodGroup) },
            { label: 'Emergency contact', value: a.emergencyContactName || null },
            { label: 'Emergency phone', value: a.emergencyContactPhone || null },
        ];
        this.details.set(rows);
        this.missingCount.set(rows.filter(r => !r.value).length);
    }

    /** Enum names arrive as e.g. "PreferNotToSay" → "Prefer not to say". */
    private humanize(value: string | null): string | null {
        if (!value) return null;
        const words = value.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
        return words.charAt(0).toUpperCase() + words.slice(1);
    }

    /** "O_Positive" → "O+", "AB_Negative" → "AB−". */
    private bloodGroup(value: string | null): string | null {
        if (!value) return null;
        return value.replace(/_Positive$/, '+').replace(/_Negative$/, '−').replace(/_/g, ' ');
    }
}
