import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SecurityService } from "../../../../services/admin/security.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-fA-F:]{2,45}$/;

const ipAddressValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    return IPV4.test(value) || (value.includes(':') && IPV6.test(value)) ? null : { ipAddress: true };
};

const DURATIONS = [
    { label: '15 minutes', minutes: 15 },
    { label: '1 hour', minutes: 60 },
    { label: '24 hours', minutes: 24 * 60 },
    { label: '7 days', minutes: 7 * 24 * 60 },
    { label: '30 days', minutes: 30 * 24 * 60 },
];

const FIELD = 'w-full h-9 px-3 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';
const CARD = 'bg-surface rounded-2 border border-borderGray/60';

/** Block or unblock an IP address platform-wide. The API has no list of blocked addresses yet. */
@Component({
    selector: 'superadmin-ip-access',
    standalone: true,
    imports: [SharedModule, SuperadminPageHeaderComponent, BooSelectComponent],
    template: `
        <div class="space-y-5">
            <superadmin-page-header
                title="IP access"
                description="Stop an abusive address from reaching the platform, or let it back in."
            />

            <div
                role="note"
                class="flex items-start gap-3 rounded-2 border border-primary/20 bg-primary/5 px-4 py-3 text-[13px] text-regular"
            >
                <physio-icon name="info" [class]="'text-primary shrink-0 mt-0.5'" />
                <p class="m-0">
                    Blocks apply to <strong>every tenant</strong> at once. The list of blocked addresses isn't available yet,
                    so keep a note of what you block. Never block your own address.
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                <!-- Block -->
                <section [class]="card" aria-labelledby="block-title">
                    <h3 id="block-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Block an address</h3>
                    <form [formGroup]="blockForm" class="p-4 space-y-4" (ngSubmit)="confirmBlock()">
                        <div class="space-y-1">
                            <label for="block-ip" class="text-[13px] font-medium text-regular">IP address <span class="text-danger" aria-hidden="true">*</span></label>
                            <input id="block-ip" type="text" formControlName="ipAddress" [class]="field + ' font-mono'" autocomplete="off" placeholder="203.0.113.7" />
                            <p *ngIf="showError(blockForm, 'ipAddress')" class="text-[12px] text-danger m-0">Enter a valid IPv4 or IPv6 address.</p>
                        </div>
                        <div class="space-y-1">
                            <span class="block text-[13px] font-medium text-regular">Block for</span>
                            <boo-select
                                formControlName="durationMinutes"
                                label="Choose a duration"
                                required
                                [height]="36"
                                [options]="durationOptions"
                            ></boo-select>
                        </div>
                        <div class="space-y-1">
                            <label for="block-reason" class="text-[13px] font-medium text-regular">Reason <span class="text-danger" aria-hidden="true">*</span></label>
                            <textarea
                                id="block-reason"
                                formControlName="reason"
                                rows="3"
                                maxlength="300"
                                class="w-full px-3 py-2 rounded-1.5 border border-borderGray bg-surface text-[13px] text-regular focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                            ></textarea>
                            <p *ngIf="showError(blockForm, 'reason')" class="text-[12px] text-danger m-0">Say why, so the audit trail makes sense later.</p>
                        </div>
                        <button
                            type="submit"
                            class="h-9 px-4 rounded-1.5 border border-danger/30 bg-surface text-[13px] font-semibold text-danger hover:bg-danger/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            [disabled]="blocking()"
                        >
                            {{ blocking() ? 'Blocking…' : 'Block address' }}
                        </button>
                    </form>
                </section>

                <!-- Unblock -->
                <section [class]="card" aria-labelledby="unblock-title">
                    <h3 id="unblock-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Unblock an address</h3>
                    <form [formGroup]="unblockForm" class="p-4 space-y-4" (ngSubmit)="unblock()">
                        <div class="space-y-1">
                            <label for="unblock-ip" class="text-[13px] font-medium text-regular">IP address <span class="text-danger" aria-hidden="true">*</span></label>
                            <input id="unblock-ip" type="text" formControlName="ipAddress" [class]="field + ' font-mono'" autocomplete="off" placeholder="203.0.113.7" />
                            <p *ngIf="showError(unblockForm, 'ipAddress')" class="text-[12px] text-danger m-0">Enter a valid IPv4 or IPv6 address.</p>
                        </div>
                        <button
                            type="submit"
                            class="h-9 px-4 rounded-1.5 bg-primary text-white text-[13px] font-semibold hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            [disabled]="unblocking()"
                        >
                            {{ unblocking() ? 'Unblocking…' : 'Unblock address' }}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    `
})
export class SuperadminIpAccessComponent {
    // #region Inject Services
    private readonly fb = inject(FormBuilder);
    private readonly securitySrv = inject(SecurityService);
    private readonly dialogSrv = inject(DialogService);
    private readonly toastSrv = inject(ToastService);
    // #endregion

    // #region Inputs, Outputs, Properties
    readonly card = CARD;
    readonly field = FIELD;
    readonly durationOptions = DURATIONS.map(d => ({ label: d.label, value: d.minutes }));

    blocking = signal(false);
    unblocking = signal(false);

    blockForm = this.fb.group({
        ipAddress: ['', [Validators.required, ipAddressValidator]],
        durationMinutes: [DURATIONS[2].minutes, [Validators.required]],
        reason: ['', [Validators.required, Validators.maxLength(300)]],
    });

    unblockForm = this.fb.group({
        ipAddress: ['', [Validators.required, ipAddressValidator]],
    });
    // #endregion

    // #region Methods
    showError(form: { get(path: string): AbstractControl | null }, control: string): boolean {
        const c = form.get(control);
        return !!c && c.invalid && (c.touched || c.dirty);
    }

    confirmBlock(): void {
        if (this.blockForm.invalid) {
            this.blockForm.markAllAsTouched();
            return;
        }
        const { ipAddress } = this.blockForm.getRawValue();
        this.dialogSrv.confirm(
            `Block ${ipAddress?.trim()} for every tenant? Make sure it is not your own address.`,
            () => this.block(),
            'Block IP address',
            'danger',
            'Block',
            'Cancel'
        );
    }

    private block(): void {
        const v = this.blockForm.getRawValue();
        this.blocking.set(true);
        this.securitySrv.blockIp({
            ipAddress: String(v.ipAddress).trim(),
            reason: String(v.reason).trim(),
            durationMinutes: Number(v.durationMinutes)
        }).pipe(
            finalize(() => this.blocking.set(false))
        ).subscribe(res => {
            if (!res.success) return;
            this.toastSrv.success(`${String(v.ipAddress).trim()} blocked`);
            this.blockForm.reset({ ipAddress: '', durationMinutes: DURATIONS[2].minutes, reason: '' });
        });
    }

    unblock(): void {
        if (this.unblockForm.invalid) {
            this.unblockForm.markAllAsTouched();
            return;
        }
        const ipAddress = String(this.unblockForm.getRawValue().ipAddress).trim();
        this.unblocking.set(true);
        this.securitySrv.unblockIp(ipAddress).pipe(
            finalize(() => this.unblocking.set(false))
        ).subscribe(res => {
            if (!res.success) return;
            this.toastSrv.success(`${ipAddress} unblocked`);
            this.unblockForm.reset({ ipAddress: '' });
        });
    }
    // #endregion
}
