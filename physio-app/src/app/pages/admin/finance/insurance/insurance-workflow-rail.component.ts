import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { WORKFLOW_STAGES, WorkflowStage } from "../../../../shared/types/insurance-claims.types";

@Component({
  selector: 'insurance-workflow-rail',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <nav class="flex items-center gap-2 overflow-x-auto py-2" role="tablist" aria-label="Claim workflow stages">
      <ng-container *ngFor="let s of stages; let last = last">
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="activeStage === s.key"
          class="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border"
          [ngClass]="activeStage === s.key
            ? 'bg-[var(--ic-forest)] text-[var(--ic-ivory)] border-[var(--ic-forest)]'
            : 'bg-[var(--ic-ivory)] text-[var(--ic-warm-gray-700)] border-[var(--ic-warm-gray-300)] hover:border-[var(--ic-forest)]/50'"
          (click)="toggle(s.key)"
        >
          {{ s.label }}
          <span
            class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px]"
            [ngClass]="activeStage === s.key ? 'bg-[var(--ic-ivory)]/25 text-[var(--ic-ivory)]' : 'bg-[var(--ic-warm-gray-200)] text-[var(--ic-warm-gray-700)]'"
          >{{ countFor(s.key) }}</span>
        </button>
        <boo-icon *ngIf="!last" name="chevron-right" [size]="12" iconClass="text-[var(--ic-warm-gray-400)] shrink-0"></boo-icon>
      </ng-container>
    </nav>
  `,
})
export class InsuranceWorkflowRailComponent {
  @Input() counts: Partial<Record<WorkflowStage, number>> = {};
  @Input() activeStage: WorkflowStage | null = null;
  @Output() stageToggled = new EventEmitter<WorkflowStage | null>();

  readonly stages = WORKFLOW_STAGES;

  countFor(key: WorkflowStage): number {
    return this.counts[key] ?? 0;
  }

  toggle(key: WorkflowStage): void {
    this.stageToggled.emit(this.activeStage === key ? null : key);
  }
}
