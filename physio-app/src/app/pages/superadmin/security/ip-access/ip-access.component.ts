import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { SuperadminPageHeaderComponent } from "../../../../components/layout/superadmin/shared/superadmin-page-header.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { SecurityService } from "../../../../services/admin/security.service";
import { DialogService } from "../../../../services/common/dialog.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { BooTextareaComponent } from "../../../../components/textarea/boo-textarea/boo-textarea.component";
import { BooButtonComponent, BooFormFieldComponent, BooInputComponent } from "@physioboo/ui";

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

const CARD = 'bg-surface rounded-2 border border-borderGray/60';

/** Block or unblock an IP address platform-wide. The API has no list of blocked addresses yet. */
@Component({
    selector: 'superadmin-ip-access',
    standalone: true,
    imports: [SharedModule, SuperadminPageHeaderComponent, BooSelectComponent, BooTextareaComponent, BooButtonComponent, BooFormFieldComponent, BooInputComponent],
    template: `
        <div class="space-y-5">
            <superadmin-page-header
                title="IP access"
                description="Stop an abusive address from reaching the platform, or let it back in."
            />

            <div
                role="note"
                class="flex items-start gap-3 rounded-2 border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-regular"
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
                        <boo-form-field label="IP address" for="block-ip" required [error]="showError(blockForm, 'ipAddress') ? 'Enter a valid IPv4 or IPv6 address.' : null">
                            <boo-input [id]="'block-ip'" class="font-mono" formControlName="ipAddress" label="203.0.113.7" size="small" />
                        </boo-form-field>
                        <div class="space-y-1">
                            <span class="block text-sm font-medium text-regular">Block for</span>
                            <boo-select
                                formControlName="durationMinutes"
                                label="Choose a duration"
                                required
                                [height]="36"
                                [options]="durationOptions"
                            ></boo-select>
                        </div>
                        <boo-form-field label="Reason" for="block-reason" required [error]="showError(blockForm, 'reason') ? 'Say why, so the audit trail makes sense later.' : null">
                            <boo-textarea [id]="'block-reason'" formControlName="reason" [rows]="3" [maxlength]="300" size="small" />
                        </boo-form-field>
                        <button type="submit" boo-button variant="secondary" size="sm" classname="!text-danger" [disabled]="blocking()">
                            {{ blocking() ? 'Blocking…' : 'Block address' }}
                        </button>
                    </form>
                </section>

                <!-- Unblock -->
                <section [class]="card" aria-labelledby="unblock-title">
                    <h3 id="unblock-title" class="text-sm font-semibold text-regular m-0 px-4 py-3 border-b border-borderGray/60">Unblock an address</h3>
                    <form [formGroup]="unblockForm" class="p-4 space-y-4" (ngSubmit)="unblock()">
                        <boo-form-field label="IP address" for="unblock-ip" required [error]="showError(unblockForm, 'ipAddress') ? 'Enter a valid IPv4 or IPv6 address.' : null">
                            <boo-input [id]="'unblock-ip'" class="font-mono" formControlName="ipAddress" label="203.0.113.7" size="small" />
                        </boo-form-field>
                        <button type="submit" boo-button variant="primary" size="sm" [disabled]="unblocking()">
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
