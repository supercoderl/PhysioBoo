import { Component, Input } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { DISPENSE_PROGRESS_STAGES, DispenseProgressStage } from "../../../../shared/types/dispensing.types";

@Component({
    selector: 'dispense-progress-stepper',
    standalone: true,
    imports: [SharedModule, BooIconComponent],
    template: `
    <div class="flex items-center overflow-x-auto py-1" role="list" aria-label="Dispensing progress">
      <ng-container *ngFor="let s of stages; let last = last; let i = index">
        <div class="flex items-center gap-2 shrink-0" role="listitem">
          <div class="flex flex-col items-center gap-1">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center border-2 text-[11px] font-semibold"
              [ngClass]="stageClass(i)"
              [attr.aria-current]="s.stage === currentStage ? 'step' : null"
            >
              <boo-icon *ngIf="i < currentIndex" name="check" [size]="14" iconClass="text-white"></boo-icon>
              <span *ngIf="i >= currentIndex">{{ i + 1 }}</span>
            </div>
            <span class="text-[10px] font-medium whitespace-nowrap" [ngClass]="i <= currentIndex ? 'text-regular' : 'text-gray-400'">{{ s.label }}</span>
          </div>
          <div *ngIf="!last" class="w-8 h-0.5 mb-4" [ngClass]="i < currentIndex ? 'bg-primary' : 'bg-gray-200'"></div>
        </div>
      </ng-container>
    </div>
  `,
})
export class DispenseProgressStepperComponent {
    @Input({ required: true }) currentStage!: DispenseProgressStage;

    readonly stages = DISPENSE_PROGRESS_STAGES;

    get currentIndex(): number {
        return this.stages.findIndex(s => s.stage === this.currentStage);
    }

    stageClass(index: number): string {
        if (index < this.currentIndex) return 'bg-primary border-primary';
        if (index === this.currentIndex) return 'border-primary text-primary';
        return 'border-gray-300 text-gray-400';
    }
}
