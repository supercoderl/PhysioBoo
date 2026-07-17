import { Component, EventEmitter, Input, Output } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { SharedModule } from "../../../../shared/shared-imports";
import { InsuranceProviderNode, SavedSearch, SmartFolder } from "../../../../shared/types/insurance-claims.types";

interface SmartFolderDef {
  key: SmartFolder;
  label: string;
  icon: string;
}

@Component({
  selector: 'insurance-providers-tree',
  standalone: true,
  imports: [SharedModule, BooIconComponent],
  template: `
    <aside
      class="shrink-0 h-full bg-[var(--ic-ivory)] border-r border-[var(--ic-warm-gray-200)] flex flex-col transition-all duration-150"
      [ngClass]="collapsed ? 'w-11' : 'w-[240px]'"
    >
      <div class="flex items-center justify-between px-2 py-2 border-b border-[var(--ic-warm-gray-200)]">
        <span *ngIf="!collapsed" class="text-[11px] font-bold tracking-wide uppercase text-[var(--ic-warm-gray-600)]">Workspace</span>
        <button type="button" class="p-1 rounded hover:bg-[var(--ic-warm-gray-200)] ml-auto" (click)="collapsedChange.emit(!collapsed)" aria-label="Toggle panel">
          <boo-icon [name]="collapsed ? 'panel-left-open' : 'panel-left-close'" [size]="16" iconClass="text-[var(--ic-warm-gray-600)]"></boo-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto py-2" *ngIf="!collapsed">
        <!-- Providers -->
        <div class="px-2 mb-3">
          <p class="px-1 text-[10px] font-bold tracking-wide uppercase text-[var(--ic-warm-gray-500)] mb-1">Insurance Providers</p>
          <button
            type="button"
            *ngFor="let p of providers"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-1.5 text-xs text-left transition-colors"
            [ngClass]="selectedProviderId === p.id ? 'bg-[var(--ic-forest)]/10 text-[var(--ic-forest)] font-semibold' : 'text-[var(--ic-warm-gray-700)] hover:bg-[var(--ic-warm-gray-100)]'"
            (click)="providerSelected.emit(selectedProviderId === p.id ? null : p.id)"
          >
            <boo-icon name="building" [size]="14" iconClass="shrink-0"></boo-icon>
            <span class="flex-1 truncate">{{ p.name }}</span>
            <span class="text-[10px] text-[var(--ic-warm-gray-500)]">{{ p.claimCount }}</span>
          </button>
        </div>

        <!-- Smart folders -->
        <div class="px-2 mb-3">
          <p class="px-1 text-[10px] font-bold tracking-wide uppercase text-[var(--ic-warm-gray-500)] mb-1">Smart Folders</p>
          <button
            type="button"
            *ngFor="let f of folders"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-1.5 text-xs text-left transition-colors"
            [ngClass]="selectedFolder === f.key ? 'bg-[var(--ic-forest)]/10 text-[var(--ic-forest)] font-semibold' : 'text-[var(--ic-warm-gray-700)] hover:bg-[var(--ic-warm-gray-100)]'"
            (click)="folderSelected.emit(selectedFolder === f.key ? null : f.key)"
          >
            <boo-icon [name]="f.icon" [size]="14" iconClass="shrink-0"></boo-icon>
            <span class="flex-1 truncate">{{ f.label }}</span>
          </button>
        </div>

        <!-- Saved searches -->
        <div class="px-2" *ngIf="savedSearches.length > 0">
          <p class="px-1 text-[10px] font-bold tracking-wide uppercase text-[var(--ic-warm-gray-500)] mb-1">Saved Searches</p>
          <button
            type="button"
            *ngFor="let s of savedSearches"
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-1.5 text-xs text-left text-[var(--ic-warm-gray-700)] hover:bg-[var(--ic-warm-gray-100)] transition-colors"
            (click)="savedSearchSelected.emit(s)"
          >
            <boo-icon name="bookmark" [size]="14" iconClass="shrink-0"></boo-icon>
            <span class="flex-1 truncate">{{ s.name }}</span>
          </button>
        </div>
      </div>

      <!-- Collapsed icon rail -->
      <div class="flex-1 flex flex-col items-center gap-2 py-2" *ngIf="collapsed">
        <boo-icon name="building" [size]="16" iconClass="text-[var(--ic-warm-gray-500)]"></boo-icon>
        <boo-icon name="star" [size]="16" iconClass="text-[var(--ic-warm-gray-500)]"></boo-icon>
        <boo-icon name="bookmark" [size]="16" iconClass="text-[var(--ic-warm-gray-500)]"></boo-icon>
      </div>
    </aside>
  `,
})
export class InsuranceProvidersTreeComponent {
  @Input() providers: InsuranceProviderNode[] = [];
  @Input() savedSearches: SavedSearch[] = [];
  @Input() selectedProviderId: string | null = null;
  @Input() selectedFolder: SmartFolder | null = null;
  @Input() collapsed = false;

  @Output() providerSelected = new EventEmitter<string | null>();
  @Output() folderSelected = new EventEmitter<SmartFolder | null>();
  @Output() savedSearchSelected = new EventEmitter<SavedSearch>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  readonly folders: SmartFolderDef[] = [
    { key: 'pending', label: 'Pending Claims', icon: 'clock' },
    { key: 'rejected', label: 'Rejected', icon: 'x-circle' },
    { key: 'appealed', label: 'Appealed', icon: 'rotate-ccw' },
    { key: 'approved', label: 'Approved', icon: 'check-circle' },
    { key: 'archived', label: 'Archived', icon: 'archive' },
  ];
}
