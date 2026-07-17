import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { WarehouseZone } from "../../../../shared/types/inventory-management.types";

@Component({
    selector: 'warehouse-heatmap',
    standalone: true,
    imports: [SharedModule, BooIconComponent, EmptyStateComponent],
    template: `
    <boo-empty-state *ngIf="!zones.length" icon="layout-grid" title="No warehouse zones configured"></boo-empty-state>

    <div *ngIf="zones.length" class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));">
      <button type="button" *ngFor="let zone of zones" (click)="selectZone.emit(zone)"
        class="text-left p-3 rounded-1.5 border transition-all hover:shadow-card hover:-translate-y-0.5"
        [ngClass]="zoneClass(zone)">
        <div class="flex items-center justify-between mb-2">
          <boo-icon name="warehouse" [size]="14" [iconClass]="zoneIconClass(zone)"></boo-icon>
          <span *ngIf="zone.hasExpiringStock" class="w-1.5 h-1.5 rounded-full bg-rose-500" title="Expiring stock present"></span>
        </div>
        <p class="text-xs font-semibold text-regular leading-tight">{{ zone.name }}</p>
        <p class="text-[11px] text-secondary mb-1.5">{{ zone.type }}</p>
        <div class="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div class="h-full rounded-full" [ngClass]="capacityBarClass(zone)" [style.width.%]="zone.capacityPercent"></div>
        </div>
        <p class="text-[10px] text-secondary mt-1">{{ zone.isEmpty ? 'Empty' : zone.capacityPercent + '% full' }}</p>
      </button>
    </div>

    <div class="flex items-center gap-4 mt-3 text-[11px] text-secondary">
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Overstock</span>
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-300"></span> Empty</span>
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-primary"></span> High Activity</span>
      <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-rose-500"></span> Expiring Inventory</span>
    </div>
  `,
})
export class WarehouseHeatMapComponent {
    @Input() zones: WarehouseZone[] = [];
    @Output() selectZone = new EventEmitter<WarehouseZone>();

    zoneClass(zone: WarehouseZone): string {
        if (zone.isOverstocked) return 'border-amber-300 bg-amber-50/60';
        if (zone.isEmpty) return 'border-gray-200 bg-gray-50';
        if (zone.activityLevel === 'High') return 'border-primary/40 bg-primary/5';
        return 'border-borderGray/60 hover:border-primary/30';
    }

    zoneIconClass(zone: WarehouseZone): string {
        if (zone.activityLevel === 'High') return 'text-primary';
        if (zone.isOverstocked) return 'text-amber-600';
        return 'text-gray-400';
    }

    capacityBarClass(zone: WarehouseZone): string {
        if (zone.isOverstocked) return 'bg-amber-500';
        if (zone.capacityPercent > 80) return 'bg-rose-500';
        if (zone.activityLevel === 'High') return 'bg-primary';
        return 'bg-emerald-500';
    }
}
