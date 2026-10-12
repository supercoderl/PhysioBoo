import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../shared/shared-imports';
import { DevDataModule, DevDataModuleStatus } from '../../../../shared/types/dev-data.types';

const STATUS_LABEL: Record<DevDataModuleStatus, string> = {
    idle: 'Idle',
    generating: 'Running',
    done: 'Done',
    failed: 'Failed',
};

/** Status is a dot plus text, never colour alone: idle gray, running pulsing rose, done solid rose, failed deep red. */
const STATUS_DOT: Record<DevDataModuleStatus, string> = {
    idle: 'bg-[#D4D4D8]',
    generating: 'bg-primary animate-pulse motion-reduce:animate-none',
    done: 'bg-primary',
    failed: 'bg-danger',
};

/** One module of the dev data generator: its dependencies, last result and the Generate action. */
@Component({
    selector: 'superadmin-dev-data-module-card',
    standalone: true,
    imports: [SharedModule],
    template: `
        <section class="bg-surface rounded-[14px] border border-borderGray p-5 flex flex-col gap-3" [attr.aria-labelledby]="titleId">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <h3 [id]="titleId" class="text-[15px] font-medium text-regular m-0">{{ module.label }}</h3>
                    <p class="text-[13px] text-secondary mt-1 mb-0">{{ module.description }}</p>
                </div>
                <span class="shrink-0 inline-flex items-center gap-1.5 text-[12px] text-secondary">
                    <span class="w-2 h-2 rounded-full" [ngClass]="statusDot" aria-hidden="true"></span>
                    {{ statusLabel }}
                </span>
            </div>

            <div class="flex items-center gap-1.5 flex-wrap min-h-6 text-[12px] text-secondary">
                <span>Needs</span>
                <ng-container *ngIf="dependencies.length; else noDependencies">
                    <span
                        *ngFor="let dependency of dependencies"
                        class="px-2 py-0.5 rounded-md text-[12px]"
                        [ngClass]="dependency.ready ? 'bg-primarySoft text-primaryDeep' : 'bg-rowDivider text-[#52525B]'"
                    >{{ dependency.label }}</span>
                </ng-container>
                <ng-template #noDependencies><span>nothing</span></ng-template>
            </div>

            <p *ngIf="lastResult" class="text-[13px] text-secondary m-0 font-mono">{{ lastResult }}</p>

            <div class="flex items-center gap-2 mt-auto pt-1">
                <button
                    type="button"
                    class="h-8 px-3.5 rounded-lg bg-surface border border-borderGray text-[13px] font-medium text-primary hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-borderGray cursor-pointer inline-flex items-center gap-2 transition-colors"
                    [disabled]="disabled"
                    [attr.aria-disabled]="disabled"
                    (click)="generate.emit(module.key)"
                >
                    <span *ngIf="status === 'generating'" class="w-3.5 h-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin motion-reduce:animate-none" aria-hidden="true"></span>
                    {{ status === 'generating' ? 'Generating…' : status === 'failed' ? 'Retry' : 'Generate' }}
                </button>
            </div>
        </section>
    `
})
export class SuperadminDevDataModuleCardComponent {
    @Input({ required: true }) module!: DevDataModule;
    /** Label for every module key, used to name the dependencies. */
    @Input({ required: true }) labels!: Record<string, string>;
    /** What the last successful run created, e.g. "Created 20 departments, 40 rooms". */
    @Input() lastResult = '';
    @Input() status: DevDataModuleStatus = 'idle';
    /** Modules already generated in this session: their chips show as ready. */
    @Input() readyKeys: string[] = [];
    /** Generate is unavailable (no tenant, invalid count or a request is running). */
    @Input() disabled = false;

    @Output() generate = new EventEmitter<string>();

    get titleId(): string {
        return `dev-data-${this.module.key}`;
    }

    get statusLabel(): string {
        return STATUS_LABEL[this.status];
    }

    get statusDot(): string {
        return STATUS_DOT[this.status];
    }

    get dependencies(): { label: string; ready: boolean }[] {
        return this.module.dependsOn.map(key => ({ label: this.labels[key] ?? key, ready: this.readyKeys.includes(key) }));
    }
}
