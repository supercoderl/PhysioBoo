import { NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent } from '@physioboo/ui';
import { finalize } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { MemberService } from '../../../../services/admin/member.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { Member, MemberStatus, MembershipTier } from '../../../../shared/types/member.types';
import { STATUS, STATUS_OPTIONS, TIER_OPTIONS, memberName, serverMessage } from './member.utils';

/**
 * Changes a member's tier and status (PATCH /api/members/{id}). The server changes only those two columns, so the
 * balance is never touched here. Only active members can earn or redeem points.
 */
@Component({
    selector: 'crm-member-edit-drawer',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule, DrawerComponent, BooButtonComponent, BooIconComponent, BooSelectComponent],
    template: `
        <drawer [isOpen]="!!member" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
            <form
                *ngIf="member as m"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-edit-title"
                [formGroup]="form"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">Edit membership · {{ m.memberNumber }}</p>
                        <h2 id="member-edit-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(m) }}</h2>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close edit membership" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="me-tier" class="block mb-1 text-[13px] font-medium text-regular">Tier <span class="text-danger" aria-hidden="true">*</span></label>
                            <boo-select id="me-tier" formControlName="tier" label="Tier" required [options]="tierOptions" />
                        </div>
                        <div>
                            <label for="me-status" class="block mb-1 text-[13px] font-medium text-regular">Status <span class="text-danger" aria-hidden="true">*</span></label>
                            <boo-select id="me-status" formControlName="status" label="Status" required [options]="statusOptions" />
                        </div>
                    </div>

                    <p *ngIf="statusNote" class="m-0 flex items-start gap-1.5 text-xs text-secondary">
                        <physio-icon name="info" [size]="14" class="flex-none mt-px" aria-hidden="true" />{{ statusNote }}
                    </p>

                    <p *ngIf="submitError" class="m-0 flex items-start gap-2 rounded-lg border border-dangerBorder bg-dangerSoft px-3 py-2.5 text-sm text-danger" role="alert">
                        <physio-icon name="circle-alert" [size]="16" class="flex-none mt-0.5" aria-hidden="true" />
                        <span>{{ submitError }}</span>
                    </p>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!form.dirty">Save changes</button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmMemberEditDrawerComponent implements OnChanges {
    @Input() member: Member | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() saved = new EventEmitter<Member>();

    private readonly fb = inject(FormBuilder);
    private readonly memberSrv = inject(MemberService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);

    readonly tierOptions = TIER_OPTIONS;
    readonly statusOptions = STATUS_OPTIONS;
    readonly name = memberName;

    readonly form = this.fb.group({
        tier: this.fb.nonNullable.control<MembershipTier>('Basic', Validators.required),
        status: this.fb.nonNullable.control<MemberStatus>('active', Validators.required),
    });

    submitting = false;
    submitError: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['member'];
        if (!change) return;
        const next = change.currentValue as Member | null;
        const prev = change.previousValue as Member | null;
        if (next && next.id !== prev?.id) {
            this.submitError = null;
            this.form.reset({ tier: next.membershipType, status: next.status });
        }
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.member) this.requestClose();
    }

    get statusNote(): string | null {
        const status = this.form.controls.status.value;
        if (!this.member || status === this.member.status) return null;
        return status === 'active'
            ? 'Reactivating lets this member earn and redeem points again.'
            : `While ${STATUS[status].label.toLowerCase()}, this member keeps their balance but can't earn or redeem points.`;
    }

    submit(): void {
        const m = this.member;
        if (!m || this.submitting || this.form.invalid || !this.form.dirty) return;
        const { tier, status } = this.form.getRawValue();
        this.submitting = true;
        this.submitError = null;
        this.memberSrv.update(m.id, { tier, status })
            .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: res => {
                    if (res && res.success === false) {
                        this.submitError = res.errors?.[0] ?? "The changes weren't saved.";
                        return;
                    }
                    this.form.markAsPristine();
                    this.saved.emit({ ...m, membershipType: tier, status });
                },
                error: err => this.submitError = serverMessage(err) ?? "The changes weren't saved. Check your connection and try again.",
            });
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    discard(): void {
        if (this.submitting) return;
        this.form.markAsPristine();
        this.close.emit();
    }
}
