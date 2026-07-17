import { Component, OnInit, computed, signal } from "@angular/core";
import { finalize, forkJoin } from "rxjs";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { InsuranceClaimsService } from "../../../../services/admin/insurance-claims.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import {
  ClaimActionMode,
  ClaimQueueDensity,
  InsuranceClaimCard,
  InsuranceClaimDetail,
  InsuranceClaimStats,
  InsuranceProviderNode,
  SavedSearch,
  SmartFolder,
  WORKFLOW_STAGES,
  WorkflowStage,
} from "../../../../shared/types/insurance-claims.types";
import { ClaimActionSubmitPayload, InsuranceClaimActionDialogComponent } from "./insurance-claim-action-dialog.component";
import { InsuranceClaimCardComponent } from "./insurance-claim-card.component";
import { InsuranceClaimDetailPanelComponent } from "./insurance-claim-detail-panel.component";
import { InsuranceProvidersTreeComponent } from "./insurance-providers-tree.component";
import { InsuranceWorkflowRailComponent } from "./insurance-workflow-rail.component";

const LOADING_KEY = 'insurance-claims-workspace';

@Component({
  selector: 'admin-insurance',
  standalone: true,
  imports: [
    SharedModule,
    BooIconComponent,
    EmptyStateComponent,
    InsuranceProvidersTreeComponent,
    InsuranceWorkflowRailComponent,
    InsuranceClaimCardComponent,
    InsuranceClaimDetailPanelComponent,
    InsuranceClaimActionDialogComponent,
  ],
  host: { class: 'block h-full overflow-hidden' },
  styles: [`
    :host {
      --ic-ivory: #FAF7F0;
      --ic-warm-gray-50: #FBFAF7;
      --ic-warm-gray-100: #F3EFE7;
      --ic-warm-gray-200: #E7E0D2;
      --ic-warm-gray-300: #D6CCB8;
      --ic-warm-gray-400: #B8AC91;
      --ic-warm-gray-500: #96896E;
      --ic-warm-gray-600: #766B54;
      --ic-warm-gray-700: #5B5240;
      --ic-forest: #2F5233;
      --ic-forest-dark: #1F3A22;
      --ic-olive: #6B6B3A;
      --ic-amber: #B8860B;
      --ic-emerald: #3E7C59;
      --ic-graphite: #2A2A28;
      --ic-rose: #A6423B;
      background: var(--ic-ivory);
    }
  `],
  template: `
    <!-- Loading -->
    <div *ngIf="loadingSrv.isLoading(LOADING_KEY) && !hasLoadedOnce" class="flex flex-col items-center justify-center h-full gap-3">
      <boo-icon name="loader" [size]="28" iconClass="animate-spin text-[var(--ic-forest)]"></boo-icon>
      <span class="text-[var(--ic-warm-gray-600)] text-xs">Loading claim workspace…</span>
    </div>

    <!-- Error -->
    <div *ngIf="hasError && !loadingSrv.isLoading(LOADING_KEY)" class="h-full flex items-center justify-center px-6">
      <div class="bg-[var(--ic-rose)]/8 border border-[var(--ic-rose)]/30 rounded-1.5 p-6 flex items-center gap-4">
        <boo-icon name="alert-circle" [size]="20" iconClass="text-[var(--ic-rose)]"></boo-icon>
        <span class="text-[var(--ic-rose)] text-sm">Unable to load the insurance claims workspace.</span>
        <button (click)="load()" class="px-3 py-1.5 bg-[var(--ic-rose)] text-white rounded-1.5 text-xs font-semibold hover:opacity-90">Retry</button>
      </div>
    </div>

    <div class="h-full flex flex-col" *ngIf="!hasError && hasLoadedOnce">
      <!-- Top toolbar -->
      <header class="h-14 shrink-0 flex items-center gap-3 px-3 border-b border-[var(--ic-warm-gray-200)]">
        <div class="relative w-64 shrink-0">
          <boo-icon name="search" [size]="14" iconClass="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ic-warm-gray-500)]"></boo-icon>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Search claims, patients, claim #…"
            class="w-full pl-8 pr-2 py-1.5 text-xs border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]"
          />
        </div>

        <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="text-xs px-2 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)]">
          <option value="">All Status</option>
          <option *ngFor="let s of statusOptions" [value]="s">{{ s }}</option>
        </select>

        <select [ngModel]="priorityFilter()" (ngModelChange)="priorityFilter.set($event)" class="text-xs px-2 py-1.5 border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)]">
          <option value="">Any Priority</option>
          <option value="Low">Low</option>
          <option value="Normal">Normal</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <div class="flex-1"></div>

        <!-- Floating widgets -->
        <div class="hidden xl:flex items-center gap-3 mr-2" *ngIf="stats() as s">
          <div class="flex items-center gap-1.5" title="Claim health score">
            <div class="w-7 h-7 rounded-full grid place-items-center text-[9px] font-bold text-[var(--ic-emerald)]"
              [style.background]="ringGradient(s.claimHealthScore, 'var(--ic-emerald)')">
              <span class="w-5 h-5 rounded-full bg-[var(--ic-ivory)] grid place-items-center">{{ s.claimHealthScore }}</span>
            </div>
            <span class="text-[10px] text-[var(--ic-warm-gray-600)] leading-tight">Health</span>
          </div>
          <div class="flex items-center gap-1.5" title="Average risk score">
            <div class="w-7 h-7 rounded-full grid place-items-center text-[9px] font-bold text-[var(--ic-amber)]"
              [style.background]="ringGradient(s.riskScoreAvg, 'var(--ic-amber)')">
              <span class="w-5 h-5 rounded-full bg-[var(--ic-ivory)] grid place-items-center">{{ s.riskScoreAvg }}</span>
            </div>
            <span class="text-[10px] text-[var(--ic-warm-gray-600)] leading-tight">Risk</span>
          </div>
          <div class="flex items-center gap-1 text-[var(--ic-amber)]" title="Claims with missing documents">
            <boo-icon name="file-warning" [size]="14" iconClass="text-[var(--ic-amber)]"></boo-icon>
            <span class="text-xs font-bold">{{ s.missingDocumentsCount }}</span>
          </div>
          <div class="flex items-end gap-[2px] h-6" title="Approval velocity (last 7 submissions, days)">
            <span *ngFor="let v of s.approvalVelocityTrend" class="w-1 rounded-t bg-[var(--ic-olive)]" [style.height.%]="(v / maxVelocity(s)) * 100"></span>
          </div>
        </div>

        <div class="flex items-center bg-[var(--ic-warm-gray-100)] rounded-1.5 p-0.5">
          <button *ngFor="let d of densities" type="button" (click)="density.set(d.key)"
            class="px-2 py-1 text-[10px] font-semibold rounded transition-colors"
            [ngClass]="density() === d.key ? 'bg-[var(--ic-ivory)] text-[var(--ic-forest)] shadow-sm' : 'text-[var(--ic-warm-gray-600)]'"
            [title]="d.label">
            <boo-icon [name]="d.icon" [size]="13"></boo-icon>
          </button>
        </div>

        <button type="button" class="px-3 py-1.5 bg-[var(--ic-forest)] text-[var(--ic-ivory)] rounded-1.5 text-xs font-semibold hover:bg-[var(--ic-forest-dark)] transition-colors flex items-center gap-1.5" (click)="openDialog('create')">
          <boo-icon name="circle-plus" [size]="14"></boo-icon> New Claim
        </button>
      </header>

      <!-- Workflow rail -->
      <div class="shrink-0 px-3 border-b border-[var(--ic-warm-gray-200)]">
        <insurance-workflow-rail [counts]="stageCounts()" [activeStage]="activeStage()" (stageToggled)="activeStage.set($event)"></insurance-workflow-rail>
      </div>

      <!-- Three column workspace -->
      <div class="flex-1 flex min-h-0">
        <insurance-providers-tree
          [providers]="providers()"
          [savedSearches]="savedSearches"
          [selectedProviderId]="selectedProviderId()"
          [selectedFolder]="selectedFolder()"
          [collapsed]="leftCollapsed()"
          (providerSelected)="selectedProviderId.set($event)"
          (folderSelected)="selectedFolder.set($event)"
          (collapsedChange)="leftCollapsed.set($event)"
          (savedSearchSelected)="applySavedSearch($event)"
        ></insurance-providers-tree>

        <!-- Center queue -->
        <main class="flex-1 min-w-0 overflow-y-auto p-3">
          <div *ngIf="filteredClaims().length === 0">
            <boo-empty-state icon="inbox" title="No claims match these filters" description="Try clearing filters or search to see the full queue.">
              <button type="button" class="px-3 py-1.5 rounded-1.5 text-xs font-semibold bg-[var(--ic-warm-gray-200)] text-[var(--ic-warm-gray-700)] hover:bg-[var(--ic-warm-gray-300)]" (click)="clearFilters()">Clear Filters</button>
            </boo-empty-state>
          </div>

          <!-- Compact / Comfortable -->
          <div *ngIf="density() === 'compact' || density() === 'comfortable'" class="grid gap-2" [ngClass]="density() === 'compact' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'">
            <insurance-claim-card
              *ngFor="let c of filteredClaims()"
              [claim]="c"
              [mode]="density()"
              [active]="selectedClaimId() === c.id"
              (open)="selectClaim($event)"
              (approve)="quickApprove($event)"
              (reject)="quickReject($event)"
            ></insurance-claim-card>
          </div>

          <!-- Kanban -->
          <div *ngIf="density() === 'kanban'" class="flex gap-3 overflow-x-auto h-full items-start pb-2">
            <div *ngFor="let col of kanbanColumns()" class="w-72 shrink-0 flex flex-col bg-[var(--ic-warm-gray-50)] rounded-1.5 border border-[var(--ic-warm-gray-200)]">
              <div class="px-3 py-2 border-b border-[var(--ic-warm-gray-200)] flex items-center justify-between">
                <span class="text-xs font-bold text-[var(--ic-graphite)]">{{ col.label }}</span>
                <span class="text-[10px] font-semibold text-[var(--ic-warm-gray-500)]">{{ col.items.length }}</span>
              </div>
              <div class="flex-1 overflow-y-auto p-2 space-y-2">
                <insurance-claim-card
                  *ngFor="let c of col.items"
                  [claim]="c"
                  mode="kanban"
                  [active]="selectedClaimId() === c.id"
                  (open)="selectClaim($event)"
                ></insurance-claim-card>
              </div>
            </div>
          </div>

          <!-- Timeline -->
          <div *ngIf="density() === 'timeline'" class="space-y-4">
            <div *ngFor="let grp of timelineGroups()">
              <p class="text-[11px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1.5">{{ grp.label }}</p>
              <div class="grid gap-2 lg:grid-cols-2">
                <insurance-claim-card
                  *ngFor="let c of grp.items"
                  [claim]="c"
                  mode="timeline"
                  [active]="selectedClaimId() === c.id"
                  (open)="selectClaim($event)"
                ></insurance-claim-card>
              </div>
            </div>
          </div>
        </main>

        <!-- Right inspector -->
        <div class="shrink-0 h-full" style="width: 420px; min-width: 360px; max-width: 640px; resize: horizontal; overflow: hidden;" *ngIf="!rightCollapsed()">
          <insurance-claim-detail-panel
            [claim]="claimDetail()"
            (closeRequested)="rightCollapsed.set(true)"
            (actionRequested)="openDialog($event)"
            (noteAdded)="addNote($event)"
            (messageSent)="sendMessage($event)"
          ></insurance-claim-detail-panel>
        </div>
        <button *ngIf="rightCollapsed()" type="button" class="shrink-0 w-8 border-l border-[var(--ic-warm-gray-200)] hover:bg-[var(--ic-warm-gray-100)] flex items-center justify-center" (click)="rightCollapsed.set(false)" aria-label="Open detail panel">
          <boo-icon name="panel-right-open" [size]="16" iconClass="text-[var(--ic-warm-gray-500)]"></boo-icon>
        </button>
      </div>
    </div>

    <insurance-claim-action-dialog
      [isOpen]="dialogOpen()"
      [mode]="dialogMode()"
      [providers]="providers()"
      (close)="closeDialog()"
      (confirmed)="confirmDialog($event)"
    ></insurance-claim-action-dialog>
  `,
})
export class AdminInsuranceComponent implements OnInit {
  readonly LOADING_KEY = LOADING_KEY;

  claims = signal<InsuranceClaimCard[]>([]);
  providers = signal<InsuranceProviderNode[]>([]);
  stats = signal<InsuranceClaimStats | null>(null);
  claimDetail = signal<InsuranceClaimDetail | null>(null);
  selectedClaimId = signal<string | null>(null);

  searchQuery = signal('');
  statusFilter = signal('');
  priorityFilter = signal('');
  activeStage = signal<WorkflowStage | null>(null);
  selectedProviderId = signal<string | null>(null);
  selectedFolder = signal<SmartFolder | null>(null);
  density = signal<ClaimQueueDensity>('comfortable');

  leftCollapsed = signal(false);
  rightCollapsed = signal(false);

  dialogOpen = signal(false);
  dialogMode = signal<ClaimActionMode | null>(null);

  hasError = false;
  hasLoadedOnce = false;

  savedSearches: SavedSearch[] = [
    { id: 'sv-1', name: 'High priority · Under Review', query: 'status=UnderReview&priority=High' },
    { id: 'sv-2', name: 'Missing documents', query: 'missingDocuments=true' },
  ];

  readonly statusOptions = ['Draft', 'WaitingDocuments', 'ReadyToSubmit', 'Submitted', 'UnderReview', 'NeedCorrection', 'Approved', 'Rejected', 'Appealed', 'Settled'];

  readonly densities: { key: ClaimQueueDensity; label: string; icon: string }[] = [
    { key: 'compact', label: 'Compact', icon: 'list' },
    { key: 'comfortable', label: 'Comfortable', icon: 'layout-grid' },
    { key: 'kanban', label: 'Kanban', icon: 'columns-3' },
    { key: 'timeline', label: 'Timeline', icon: 'calendar-range' },
  ];

  filteredClaims = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const stage = this.activeStage();
    const providerId = this.selectedProviderId();
    const folder = this.selectedFolder();

    return this.claims().filter(c => {
      if (q && !(`${c.patientName} ${c.claimNumber} ${c.mrn}`.toLowerCase().includes(q))) return false;
      if (status && c.status !== status) return false;
      if (priority && c.priority !== priority) return false;
      if (stage && c.currentStage !== stage) return false;
      if (providerId && c.providerId !== providerId) return false;
      if (folder && !this.matchesFolder(c, folder)) return false;
      return true;
    });
  });

  stageCounts = computed(() => {
    const counts: Partial<Record<WorkflowStage, number>> = {};
    for (const s of WORKFLOW_STAGES) counts[s.key] = 0;
    for (const c of this.claims()) counts[c.currentStage] = (counts[c.currentStage] ?? 0) + 1;
    return counts;
  });

  kanbanColumns = computed(() => {
    const list = this.filteredClaims();
    return WORKFLOW_STAGES.map(s => ({ key: s.key, label: s.label, items: list.filter(c => c.currentStage === s.key) }));
  });

  timelineGroups = computed(() => {
    const list = [...this.filteredClaims()].sort((a, b) => (b.submissionDate ?? '').localeCompare(a.submissionDate ?? ''));
    const groups = new Map<string, InsuranceClaimCard[]>();
    for (const c of list) {
      const label = c.submissionDate ? new Date(c.submissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not submitted';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label)!.push(c);
    }
    return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
  });

  constructor(
    private srv: InsuranceClaimsService,
    private toastSrv: ToastService,
    protected loadingSrv: LocalLoadingService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.hasError = false;
    this.loadingSrv.setLoading(LOADING_KEY, true);

    forkJoin({
      claims: this.srv.getClaims(),
      stats: this.srv.getStats(),
      providers: this.srv.getProvidersTree(),
    })
      .pipe(finalize(() => this.loadingSrv.setLoading(LOADING_KEY, false)))
      .subscribe({
        next: ({ claims, stats, providers }) => {
          if (claims.success) this.claims.set(claims.data.items);
          if (stats.success) this.stats.set(stats.data);
          if (providers.success) this.providers.set(providers.data);
          this.hasLoadedOnce = true;
        },
        error: () => {
          this.hasError = true;
          this.hasLoadedOnce = true;
        },
      });
  }

  matchesFolder(c: InsuranceClaimCard, folder: SmartFolder): boolean {
    switch (folder) {
      case 'pending': return ['Draft', 'WaitingDocuments', 'ReadyToSubmit', 'Submitted', 'UnderReview', 'NeedCorrection'].includes(c.status);
      case 'rejected': return c.status === 'Rejected';
      case 'appealed': return c.status === 'Appealed';
      case 'approved': return c.status === 'Approved' || c.status === 'Settled';
      case 'archived': return c.status === 'Settled';
      default: return true;
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('');
    this.priorityFilter.set('');
    this.activeStage.set(null);
    this.selectedProviderId.set(null);
    this.selectedFolder.set(null);
  }

  applySavedSearch(s: SavedSearch): void {
    this.toastSrv.info(`Applied saved search "${s.name}"`);
  }

  selectClaim(id: string): void {
    this.selectedClaimId.set(id);
    this.rightCollapsed.set(false);
    this.srv.getClaimDetail(id).subscribe(res => {
      if (res.success) this.claimDetail.set(res.data);
    });
  }

  quickApprove(id: string): void {
    this.selectClaim(id);
    this.openDialog('approve');
  }

  quickReject(id: string): void {
    this.selectClaim(id);
    this.openDialog('reject');
  }

  openDialog(mode: ClaimActionMode): void {
    this.dialogMode.set(mode);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  confirmDialog(payload: ClaimActionSubmitPayload): void {
    const claimId = this.selectedClaimId();

    switch (payload.mode) {
      case 'create':
        this.srv.createClaim({
          patientId: '',
          patientName: payload.create.patientName,
          providerId: payload.create.providerId,
          policyNumber: payload.create.policyNumber,
          diagnosis: payload.create.diagnosis,
          procedures: [],
          claimAmount: payload.create.claimAmount,
          department: payload.create.department,
          doctorName: payload.create.doctorName,
          priority: payload.create.priority,
        }).subscribe(res => {
          if (res.success) {
            this.toastSrv.success('Claim created');
            this.load();
          }
        });
        break;
      case 'submit':
        if (claimId) this.srv.submitClaim(claimId, payload.notes).subscribe(() => { this.toastSrv.success('Claim submitted'); this.refreshAfterAction(claimId); });
        break;
      case 'approve':
        if (claimId) this.srv.approveClaim(claimId, payload.approvedAmount, payload.notes).subscribe(() => { this.toastSrv.success('Claim approved'); this.refreshAfterAction(claimId); });
        break;
      case 'reject':
        if (claimId) this.srv.rejectClaim(claimId, payload.notes).subscribe(() => { this.toastSrv.success('Claim rejected'); this.refreshAfterAction(claimId); });
        break;
      case 'appeal':
        if (claimId) this.srv.appealClaim(claimId, payload.notes).subscribe(() => { this.toastSrv.success('Appeal filed'); this.refreshAfterAction(claimId); });
        break;
      case 'settle':
        if (claimId) this.srv.settleClaim(claimId, payload.settledAmount, new Date().toISOString(), payload.settlementMethod).subscribe(() => { this.toastSrv.success('Settlement recorded'); this.refreshAfterAction(claimId); });
        break;
      case 'upload':
        if (claimId && payload.files.length) {
          payload.files.forEach(f => this.srv.uploadDocument(claimId, f, 'PDF').subscribe());
          this.toastSrv.success(`${payload.files.length} document(s) uploaded`);
          this.refreshAfterAction(claimId);
        }
        break;
    }

    this.closeDialog();
  }

  refreshAfterAction(claimId: string): void {
    this.load();
    this.selectClaim(claimId);
  }

  addNote(message: string): void {
    const claimId = this.selectedClaimId();
    if (!claimId) return;
    this.srv.addNote(claimId, message).subscribe(res => {
      if (res.success && this.claimDetail()) {
        this.claimDetail.set({ ...this.claimDetail()!, notes: [...this.claimDetail()!.notes, res.data] });
      }
    });
  }

  sendMessage(message: string): void {
    const claimId = this.selectedClaimId();
    if (!claimId) return;
    this.srv.sendMessage(claimId, message).subscribe(res => {
      if (res.success && this.claimDetail()) {
        this.claimDetail.set({ ...this.claimDetail()!, communication: [...this.claimDetail()!.communication, res.data] });
      }
    });
  }

  ringGradient(value: number, color: string): string {
    const pct = Math.max(0, Math.min(100, value));
    return `conic-gradient(${color} ${pct}%, var(--ic-warm-gray-200) 0)`;
  }

  maxVelocity(s: InsuranceClaimStats): number {
    return Math.max(...s.approvalVelocityTrend, 1);
  }
}
