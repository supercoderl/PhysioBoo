import { DecimalPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { MemberService } from '../../../../services/admin/member.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { PagedResponse } from '../../../../shared/types/common';
import { Member } from '../../../../shared/types/member.types';
import { Reward } from '../../../../shared/types/reward.types';
import { MAX_NOTE_LENGTH, MAX_POINTS_PER_ADD, REWARD_CATEGORY, memberName, serverMessage } from './member.utils';

export type PointsMode = 'add' | 'redeem';

/**
 * Adds points to a member (POST /api/members/{id}/points/add) or redeems one reward with them
 * (POST /api/members/{id}/points/redeem). The server only redeems whole rewards at their listed cost, so there is
 * no free-form deduction. Each change is confirmed first; on failure the form keeps what was entered.
 */
@Component({
    selector: 'crm-member-points-drawer',
    standalone: true,
    imports: [
        NgIf,
        DecimalPipe,
        ReactiveFormsModule,
        DrawerComponent,
        BooButtonComponent,
        BooIconComponent,
        BooInputComponent,
        BooSelectComponent,
        BooTextareaComponent,
        CustomScrollbarDirective,
    ],
    template: `
        <drawer [isOpen]="!!member" [isShowDialog]="dirty && !submitting" (close)="discard()">
            <form
                *ngIf="member as m"
                class="flex flex-col h-svh bg-surface"
                role="dialog"
                aria-modal="true"
                aria-labelledby="member-points-title"
                [formGroup]="mode === 'add' ? addForm : redeemForm"
                (ngSubmit)="submit()"
                novalidate
                [attr.aria-busy]="submitting"
            >
                <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <p class="m-0 text-xs font-medium text-secondary tabular-nums">{{ mode === 'add' ? 'Add points' : 'Redeem reward' }} · {{ m.memberNumber }}</p>
                        <h2 id="member-points-title" class="m-0 mt-0.5 text-lg font-semibold leading-tight text-regular break-words">{{ name(m) }}</h2>
                    </div>
                    <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close" (click)="requestClose()">
                        <physio-icon name="x" [size]="18" />
                    </button>
                </header>

                <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5" custom-scrollbar>
                    <!-- Balance before and after, side by side so the change reads at a glance -->
                    <dl class="m-0 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-body px-4 py-3" aria-live="polite">
                        <div>
                            <dt class="text-xs text-secondary">Current balance</dt>
                            <dd class="m-0 mt-0.5 text-lg font-semibold text-regular tabular-nums">{{ m.points | number }} <span class="text-xs font-medium text-secondary">pts</span></dd>
                        </div>
                        <physio-icon name="arrow-right" [size]="16" class="text-placeholder" aria-hidden="true" />
                        <div class="text-right">
                            <dt class="text-xs text-secondary">After this change</dt>
                            <dd class="m-0 mt-0.5 text-lg font-semibold tabular-nums" [class.text-regular]="balanceAfter !== null && balanceAfter >= 0" [class.text-danger]="balanceAfter !== null && balanceAfter < 0" [class.text-placeholder]="balanceAfter === null">
                                <ng-container *ngIf="balanceAfter !== null; else noAfterTpl">{{ balanceAfter | number }} <span class="text-xs font-medium text-secondary">pts</span></ng-container>
                                <ng-template #noAfterTpl>—</ng-template>
                            </dd>
                        </div>
                    </dl>

                    <!-- Add points -->
                    <ng-container *ngIf="mode === 'add'">
                        <div>
                            <label for="mp-points" class="block mb-1 text-[13px] font-medium text-regular">Points to add <span class="text-danger" aria-hidden="true">*</span></label>
                            <boo-input id="mp-points" name="mp-points" type="number" formControlName="points" [maxlength]="7" label="e.g. 100" />
                            <p class="m-0 mt-1 text-xs" [class.text-danger]="pointsInvalid" [class.text-secondary]="!pointsInvalid" [attr.role]="pointsInvalid ? 'alert' : null">
                                A whole number from 1 to {{ maxPoints | number }}.
                            </p>
                        </div>
                        <div>
                            <label for="mp-reason" class="block mb-1 text-[13px] font-medium text-regular">Reason <span class="text-danger" aria-hidden="true">*</span></label>
                            <boo-textarea id="mp-reason" name="mp-reason" formControlName="description" [rows]="3" [maxlength]="maxNote" label="e.g. Consultation visit on 12 Oct" />
                            <p class="m-0 mt-1 flex justify-between gap-3 text-xs">
                                <span [class.text-danger]="reasonInvalid" [class.text-secondary]="!reasonInvalid" [attr.role]="reasonInvalid ? 'alert' : null">Shown in the member's point history.</span>
                                <span class="text-secondary tabular-nums">{{ addForm.controls.description.value.length }}/{{ maxNote }}</span>
                            </p>
                        </div>
                    </ng-container>

                    <!-- Redeem a reward -->
                    <ng-container *ngIf="mode === 'redeem'">
                        <div>
                            <label for="mp-reward" class="block mb-1 text-[13px] font-medium text-regular">Reward <span class="text-danger" aria-hidden="true">*</span></label>
                            <ng-container *ngIf="rewardsState === 'ready'; else rewardsStateTpl">
                                <boo-select id="mp-reward" formControlName="rewardId" label="Select a reward" required [options]="rewardOptions" />
                                <p *ngIf="!rewardOptions.length" class="m-0 mt-1 text-xs text-secondary">No rewards are available to redeem right now.</p>
                            </ng-container>
                            <ng-template #rewardsStateTpl>
                                <div *ngIf="rewardsState === 'loading'" class="h-11 rounded-md bg-rowDivider animate-pulse" aria-hidden="true"></div>
                                <p *ngIf="rewardsState === 'loading'" class="sr-only" role="status">Loading rewards…</p>
                                <p *ngIf="rewardsState === 'forbidden'" class="m-0 text-xs text-danger" role="alert">You don't have access to the rewards catalog.</p>
                                <p *ngIf="rewardsState === 'failed'" class="m-0 flex items-center gap-1.5 text-xs text-danger" role="alert">
                                    <physio-icon name="circle-alert" [size]="14" aria-hidden="true" />Couldn't load rewards.
                                    <button type="button" boo-button variant="link" size="sm" (click)="retryRewards.emit()">Try again</button>
                                </p>
                            </ng-template>
                        </div>

                        <div *ngIf="selectedReward as r" class="rounded-lg border border-rowDivider px-4 py-3">
                            <div class="flex items-start justify-between gap-3">
                                <div class="min-w-0">
                                    <p class="m-0 text-sm font-semibold text-regular break-words">{{ r.title }}</p>
                                    <p class="m-0 mt-0.5 text-xs text-secondary">{{ category(r) }}<span class="tabular-nums"> · {{ r.code }}</span></p>
                                </div>
                                <p class="m-0 text-sm font-semibold text-regular tabular-nums whitespace-nowrap">{{ r.pointsRequired | number }} <span class="text-xs font-medium text-secondary">pts</span></p>
                            </div>
                            <p *ngIf="r.description" class="m-0 mt-2 text-xs text-secondary whitespace-pre-line break-words">{{ r.description }}</p>
                            <p *ngIf="shortfall > 0" class="m-0 mt-2 flex items-start gap-1.5 text-xs text-danger" role="alert">
                                <physio-icon name="circle-alert" [size]="14" class="flex-none mt-px" aria-hidden="true" />Needs {{ shortfall | number }} more points than this member has.
                            </p>
                        </div>

                        <div>
                            <label for="mp-note" class="block mb-1 text-[13px] font-medium text-regular">Note <span class="font-normal text-secondary">(optional)</span></label>
                            <boo-textarea id="mp-note" name="mp-note" formControlName="description" [rows]="2" [maxlength]="maxNote" label="Defaults to “Redeemed: reward name”" />
                        </div>
                    </ng-container>

                    <p *ngIf="submitError" class="m-0 flex items-start gap-2 rounded-lg border border-dangerBorder bg-dangerSoft px-3 py-2.5 text-sm text-danger" role="alert">
                        <physio-icon name="circle-alert" [size]="16" class="flex-none mt-0.5" aria-hidden="true" />
                        <span>{{ submitError }} Nothing was changed; your entries are kept.</span>
                    </p>
                </div>

                <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
                    <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
                    <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!canSubmit">
                        {{ mode === 'add' ? 'Add points' : 'Redeem reward' }}
                    </button>
                </footer>
            </form>
        </drawer>
    `,
})
export class CrmMemberPointsDrawerComponent implements OnChanges {
    /** The member whose points change; the drawer is open while it is set. */
    @Input() member: Member | null = null;
    @Input() mode: PointsMode = 'add';
    @Input() rewards: Reward[] = [];
    @Input() rewardsState: 'loading' | 'ready' | 'failed' | 'forbidden' = 'loading';
    @Output() close = new EventEmitter<void>();
    @Output() retryRewards = new EventEmitter<void>();
    /** The change went through; carries a short summary for the success message. */
    @Output() done = new EventEmitter<{ member: Member; summary: string }>();

    private readonly fb = inject(FormBuilder);
    private readonly memberSrv = inject(MemberService);
    private readonly dialogSrv = inject(DialogService);
    private readonly destroyRef = inject(DestroyRef);

    readonly maxPoints = MAX_POINTS_PER_ADD;
    readonly maxNote = MAX_NOTE_LENGTH;
    readonly name = memberName;

    readonly addForm = this.fb.group({
        points: this.fb.control<number | string | null>(null, [Validators.required, Validators.min(1), Validators.max(MAX_POINTS_PER_ADD), Validators.pattern(/^\d+$/)]),
        description: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(MAX_NOTE_LENGTH)]),
    });

    readonly redeemForm = this.fb.group({
        rewardId: this.fb.control<string | null>(null, Validators.required),
        description: this.fb.nonNullable.control('', Validators.maxLength(MAX_NOTE_LENGTH)),
    });

    submitting = false;
    submitError: string | null = null;
    /** Available rewards for the picker, marked when the member can't afford them; rebuilt only when inputs change. */
    rewardOptions: { value: string; label: string }[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['rewards'] || changes['member']) this.buildRewardOptions();
        const change = changes['member'];
        if (change) {
            const next = change.currentValue as Member | null;
            const prev = change.previousValue as Member | null;
            if (next && next.id !== prev?.id) this.resetForms();
        }
        if (changes['mode'] && !changes['mode'].firstChange) this.resetForms();
    }

    @HostListener('document:keydown.escape')
    onEscape(): void {
        if (this.member) this.requestClose();
    }

    get dirty(): boolean {
        return this.mode === 'add' ? this.addForm.dirty : this.redeemForm.dirty;
    }

    get pointsValue(): number | null {
        const raw = this.addForm.controls.points.value;
        if (raw === null || raw === '') return null;
        const n = Number(raw);
        return Number.isInteger(n) && n >= 1 && n <= MAX_POINTS_PER_ADD ? n : null;
    }

    get pointsInvalid(): boolean {
        const c = this.addForm.controls.points;
        return c.invalid && (c.touched || (c.dirty && c.value !== null && c.value !== ''));
    }

    get reasonInvalid(): boolean {
        const c = this.addForm.controls.description;
        return c.touched && (c.invalid || !c.value.trim());
    }

    get selectedReward(): Reward | null {
        const id = this.redeemForm.controls.rewardId.value;
        return id ? this.rewards.find(r => r.id === id) ?? null : null;
    }

    get shortfall(): number {
        const r = this.selectedReward;
        return r && this.member ? Math.max(0, r.pointsRequired - this.member.points) : 0;
    }

    /** Expected balance from the balance on screen; the server applies the change against its own current value. */
    get balanceAfter(): number | null {
        const m = this.member;
        if (!m) return null;
        if (this.mode === 'add') {
            const pts = this.pointsValue;
            return pts === null ? null : m.points + pts;
        }
        const r = this.selectedReward;
        return r ? m.points - r.pointsRequired : null;
    }

    get canSubmit(): boolean {
        if (this.submitting || this.member?.status !== 'active') return false;
        if (this.mode === 'add') return this.pointsValue !== null && !!this.addForm.controls.description.value.trim() && this.addForm.valid;
        return !!this.selectedReward && this.selectedReward.available && this.shortfall === 0 && this.redeemForm.valid;
    }

    category(r: Reward): string {
        return REWARD_CATEGORY[r.category] ?? r.category;
    }

    submit(): void {
        const m = this.member;
        if (!m || this.submitting) return;
        this.addForm.markAllAsTouched();
        this.redeemForm.markAllAsTouched();
        if (!this.canSubmit) return;

        if (this.mode === 'add') {
            const points = this.pointsValue!;
            const description = this.addForm.controls.description.value.trim();
            const after = m.points + points;
            this.dialogSrv.confirm(
                `Add ${points.toLocaleString()} points to ${memberName(m)} (${m.memberNumber})? Their balance goes from ${m.points.toLocaleString()} to ${after.toLocaleString()} points.`,
                () => this.send(m, this.memberSrv.addPoints(m.id, { points, description }), `+${points.toLocaleString()} pts · ${memberName(m)}`),
                'Add points',
                'info',
                `Add ${points.toLocaleString()} points`,
                'Go back',
            );
            return;
        }

        const r = this.selectedReward!;
        const description = this.redeemForm.controls.description.value.trim() || null;
        this.dialogSrv.confirm(
            `Redeem “${r.title}” for ${memberName(m)} (${m.memberNumber})? ${r.pointsRequired.toLocaleString()} points will be taken, leaving ${(m.points - r.pointsRequired).toLocaleString()} points.`,
            () => this.send(m, this.memberSrv.redeemPoints(m.id, { rewardId: r.id, description }), `${r.title} · −${r.pointsRequired.toLocaleString()} pts`),
            'Redeem reward',
            'warning',
            `Redeem for ${r.pointsRequired.toLocaleString()} points`,
            'Go back',
        );
    }

    requestClose(): void {
        if (this.submitting) return;
        if (this.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
        else this.discard();
    }

    /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
    discard(): void {
        if (this.submitting) return;
        this.addForm.markAsPristine();
        this.redeemForm.markAsPristine();
        this.close.emit();
    }

    private send(m: Member, request: Observable<PagedResponse<string>>, summary: string): void {
        // The confirm dialog could in theory fire twice; only one request may be in flight.
        if (this.submitting) return;
        this.submitting = true;
        this.submitError = null;
        request
            .pipe(
                finalize(() => this.submitting = false),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: res => {
                    if (res && res.success === false) {
                        this.submitError = res.errors?.[0] ?? "The change wasn't saved.";
                        return;
                    }
                    this.addForm.markAsPristine();
                    this.redeemForm.markAsPristine();
                    this.done.emit({ member: m, summary });
                },
                // The global HTTP error toast also reports it; the message stays here next to the form.
                error: err => this.submitError = serverMessage(err) ?? "The change wasn't saved. Check your connection and try again.",
            });
    }

    private buildRewardOptions(): void {
        const balance = this.member?.points ?? 0;
        this.rewardOptions = this.rewards
            .filter(r => r.available)
            .map(r => ({
                value: r.id,
                label: `${r.title} · ${r.pointsRequired.toLocaleString()} pts${r.pointsRequired > balance ? ' (not enough points)' : ''}`,
            }));
    }

    private resetForms(): void {
        this.submitError = null;
        this.addForm.reset({ points: null, description: '' });
        this.redeemForm.reset({ rewardId: null, description: '' });
    }
}
