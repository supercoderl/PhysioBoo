import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../components/ui/status-badge.component";
import { SharedModule } from "../../../../shared/shared-imports";
import {
  ClaimActionMode,
  ClaimDocument,
  DocumentStatus,
  InsuranceClaimDetail,
} from "../../../../shared/types/insurance-claims.types";

type InspectorTab = 'overview' | 'documents' | 'medical' | 'billing' | 'timeline' | 'communication' | 'notes' | 'audit';

const DOC_STATUS_TONE: Record<DocumentStatus, BadgeTone> = {
  Uploaded: 'primary',
  Missing: 'warning',
  Verified: 'success',
};

@Component({
  selector: 'insurance-claim-detail-panel',
  standalone: true,
  imports: [SharedModule, BooIconComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <section class="h-full flex flex-col bg-[var(--ic-ivory)] border-l border-[var(--ic-warm-gray-200)] min-w-0">
      <!-- Idle -->
      <div class="flex-1 flex items-center justify-center" *ngIf="!claim">
        <boo-empty-state icon="mouse-pointer-click" title="Select a claim" description="Choose a claim from the queue to open the detail workspace."></boo-empty-state>
      </div>

      <ng-container *ngIf="claim as c">
        <!-- Header -->
        <header class="px-4 py-3 border-b border-[var(--ic-warm-gray-200)]">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="text-sm font-bold text-[var(--ic-graphite)] truncate">{{ c.claimNumber }}</p>
              <p class="text-xs text-[var(--ic-warm-gray-600)] truncate">{{ c.patientName }} · {{ c.providerName }}</p>
            </div>
            <button type="button" class="p-1 rounded hover:bg-[var(--ic-warm-gray-200)] shrink-0" (click)="closeRequested.emit()" aria-label="Close detail panel">
              <boo-icon name="panel-right-close" [size]="16" iconClass="text-[var(--ic-warm-gray-600)]"></boo-icon>
            </button>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 mt-2">
            <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-forest)] text-[var(--ic-ivory)] hover:bg-[var(--ic-forest-dark)] disabled:opacity-40 disabled:cursor-not-allowed" [disabled]="!canSubmit" (click)="actionRequested.emit('submit')">Submit</button>
            <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-emerald)]/10 text-[var(--ic-emerald)] hover:bg-[var(--ic-emerald)]/20 disabled:opacity-40 disabled:cursor-not-allowed" [disabled]="!canApprove" (click)="actionRequested.emit('approve')">Approve</button>
            <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-rose)]/10 text-[var(--ic-rose)] hover:bg-[var(--ic-rose)]/20 disabled:opacity-40 disabled:cursor-not-allowed" [disabled]="!canReject" (click)="actionRequested.emit('reject')">Reject</button>
            <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-amber)]/10 text-[var(--ic-amber)] hover:bg-[var(--ic-amber)]/20 disabled:opacity-40 disabled:cursor-not-allowed" [disabled]="!canAppeal" (click)="actionRequested.emit('appeal')">Appeal</button>
            <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-warm-gray-200)] text-[var(--ic-warm-gray-700)] hover:bg-[var(--ic-warm-gray-300)] disabled:opacity-40 disabled:cursor-not-allowed" [disabled]="!canSettle" (click)="actionRequested.emit('settle')">Settlement</button>
            <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold text-[var(--ic-warm-gray-600)] hover:bg-[var(--ic-warm-gray-200)]" (click)="print()">Print</button>
          </div>
        </header>

        <!-- Tabs -->
        <nav class="flex items-center gap-0.5 px-2 border-b border-[var(--ic-warm-gray-200)] overflow-x-auto" role="tablist">
          <button *ngFor="let t of tabs" type="button" role="tab" [attr.aria-selected]="activeTab() === t.key"
            class="px-2.5 py-2 text-[11px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors"
            [ngClass]="activeTab() === t.key ? 'border-[var(--ic-forest)] text-[var(--ic-forest)]' : 'border-transparent text-[var(--ic-warm-gray-500)] hover:text-[var(--ic-graphite)]'"
            (click)="activeTab.set(t.key)">
            {{ t.label }}
          </button>
        </nav>

        <div class="flex-1 overflow-y-auto p-4 text-xs">
          <!-- Overview -->
          <div *ngIf="activeTab() === 'overview'" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-[10px] text-[var(--ic-warm-gray-500)] mb-0.5">Policy Number</p><p class="font-semibold text-[var(--ic-graphite)]">{{ c.policyNumber }}</p></div>
              <div><p class="text-[10px] text-[var(--ic-warm-gray-500)] mb-0.5">Claim Amount</p><p class="font-semibold text-[var(--ic-forest)]">{{ formatAmount(c.claimAmount) }}</p></div>
              <div><p class="text-[10px] text-[var(--ic-warm-gray-500)] mb-0.5">Hospital / Department</p><p class="text-[var(--ic-graphite)]">{{ c.hospital }} · {{ c.department }}</p></div>
              <div><p class="text-[10px] text-[var(--ic-warm-gray-500)] mb-0.5">Doctor</p><p class="text-[var(--ic-graphite)]">{{ c.doctorName }}</p></div>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1">Coverage</p>
              <div class="flex justify-between text-[11px] mb-1">
                <span class="text-[var(--ic-warm-gray-600)]">Used {{ formatAmount(c.coverage.usedAmount) }}</span>
                <span class="text-[var(--ic-warm-gray-600)]">Available {{ formatAmount(c.coverage.availableAmount) }}</span>
              </div>
              <div class="h-1.5 rounded-full bg-[var(--ic-warm-gray-200)] overflow-hidden">
                <div class="h-full bg-[var(--ic-olive)]" [style.width.%]="(c.coverage.usedAmount / c.coverage.totalCoverage) * 100"></div>
              </div>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1">Diagnosis</p>
              <p class="text-[var(--ic-graphite)]">{{ c.diagnosis }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1">Procedures</p>
              <ul class="list-disc list-inside text-[var(--ic-graphite)] space-y-0.5">
                <li *ngFor="let p of c.procedures">{{ p }}</li>
              </ul>
            </div>
          </div>

          <!-- Documents -->
          <div *ngIf="activeTab() === 'documents'" class="space-y-3">
            <div
              class="border-2 border-dashed rounded-1.5 p-4 text-center transition-colors"
              [ngClass]="dragOver ? 'border-[var(--ic-forest)] bg-[var(--ic-forest)]/5' : 'border-[var(--ic-warm-gray-300)]'"
              (dragover)="onDragOver($event)" (dragleave)="dragOver = false" (drop)="onDrop($event)"
            >
              <boo-icon name="upload-cloud" [size]="20" iconClass="text-[var(--ic-warm-gray-400)] mx-auto mb-1"></boo-icon>
              <p class="text-[11px] text-[var(--ic-warm-gray-600)]">Drag and drop files, or</p>
              <button type="button" class="text-[11px] font-semibold text-[var(--ic-forest)] hover:underline" (click)="actionRequested.emit('upload')">browse to upload</button>
            </div>

            <div *ngFor="let d of c.documents" class="flex items-center gap-2 p-2 rounded-1.5 border border-[var(--ic-warm-gray-200)]" [class.opacity-70]="selectedDoc === d">
              <button type="button" class="flex items-center gap-2 flex-1 min-w-0 text-left" (click)="selectedDoc = selectedDoc === d ? null : d">
                <boo-icon [name]="docIcon(d)" [size]="16" iconClass="text-[var(--ic-warm-gray-500)] shrink-0"></boo-icon>
                <span class="flex-1 min-w-0 truncate text-[var(--ic-graphite)]">{{ d.name }}</span>
              </button>
              <boo-status-badge [label]="d.status" [tone]="docTone(d.status)"></boo-status-badge>
            </div>

            <div *ngIf="selectedDoc as d" class="border border-[var(--ic-warm-gray-200)] rounded-1.5 p-3 bg-[var(--ic-warm-gray-50)]">
              <p class="text-[11px] font-semibold mb-2">{{ d.name }} — preview</p>
              <div class="h-40 flex items-center justify-center bg-[var(--ic-ivory)] border border-dashed border-[var(--ic-warm-gray-300)] rounded-1.5">
                <ng-container *ngIf="d.status === 'Missing'; else previewAvailable">
                  <span class="text-[11px] text-[var(--ic-amber)]">Not yet uploaded</span>
                </ng-container>
                <ng-template #previewAvailable>
                  <div class="flex flex-col items-center gap-1 text-[var(--ic-warm-gray-500)]">
                    <boo-icon [name]="docIcon(d)" [size]="28"></boo-icon>
                    <span class="text-[10px]">{{ d.type }} preview · {{ d.sizeKb }} KB</span>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Medical Records -->
          <div *ngIf="activeTab() === 'medical'" class="space-y-3">
            <div><p class="text-[10px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1">Diagnosis</p><p>{{ c.diagnosis }}</p></div>
            <div><p class="text-[10px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1">Procedures Performed</p>
              <ul class="list-disc list-inside space-y-0.5"><li *ngFor="let p of c.procedures">{{ p }}</li></ul>
            </div>
            <div *ngIf="c.hospitalNotes"><p class="text-[10px] font-bold uppercase tracking-wide text-[var(--ic-warm-gray-500)] mb-1">Hospital Notes</p><p class="text-[var(--ic-graphite)]">{{ c.hospitalNotes }}</p></div>
          </div>

          <!-- Billing -->
          <div *ngIf="activeTab() === 'billing'" class="space-y-2">
            <div class="flex justify-between border-b border-dashed border-[var(--ic-warm-gray-200)] pb-1 font-semibold text-[10px] uppercase tracking-wide text-[var(--ic-warm-gray-500)]">
              <span>Line item</span><span>Amount</span>
            </div>
            <div class="flex justify-between" *ngFor="let li of c.invoice.lineItems">
              <span class="text-[var(--ic-graphite)]">{{ li.description }} × {{ li.quantity }}</span>
              <span>{{ formatAmount(li.amount) }}</span>
            </div>
            <div class="border-t border-[var(--ic-warm-gray-200)] pt-2 space-y-1">
              <div class="flex justify-between text-[var(--ic-warm-gray-600)]"><span>Subtotal</span><span>{{ formatAmount(c.invoice.subtotal) }}</span></div>
              <div class="flex justify-between text-[var(--ic-warm-gray-600)]"><span>Discount</span><span>-{{ formatAmount(c.invoice.discount) }}</span></div>
              <div class="flex justify-between text-[var(--ic-warm-gray-600)]"><span>Tax</span><span>{{ formatAmount(c.invoice.tax) }}</span></div>
              <div class="flex justify-between font-bold text-[var(--ic-forest)]"><span>Total</span><span>{{ formatAmount(c.invoice.total) }}</span></div>
            </div>
          </div>

          <!-- Approval Timeline -->
          <div *ngIf="activeTab() === 'timeline'" class="relative pl-4">
            <div class="absolute left-[7px] top-1 bottom-1 w-px bg-[var(--ic-warm-gray-200)]"></div>
            <div *ngFor="let ev of c.timeline" class="relative pb-4 last:pb-0">
              <span class="absolute -left-4 top-0.5 w-2.5 h-2.5 rounded-full bg-[var(--ic-forest)] ring-2 ring-[var(--ic-ivory)]"></span>
              <p class="font-semibold text-[var(--ic-graphite)]">{{ ev.type }}</p>
              <p class="text-[10px] text-[var(--ic-warm-gray-500)]">{{ ev.actor }} · {{ ev.occurredAt | date:'dd/MM/yyyy HH:mm' }}</p>
              <p *ngIf="ev.note" class="text-[11px] text-[var(--ic-warm-gray-600)] mt-0.5">{{ ev.note }}</p>
            </div>
          </div>

          <!-- Communication -->
          <div *ngIf="activeTab() === 'communication'" class="space-y-2">
            <div *ngFor="let m of c.communication" class="p-2 rounded-1.5" [ngClass]="m.direction === 'Outbound' ? 'bg-[var(--ic-forest)]/8 ml-4' : 'bg-[var(--ic-warm-gray-100)] mr-4'">
              <p class="text-[10px] font-semibold text-[var(--ic-warm-gray-600)]">{{ m.from }} · {{ m.sentAt | date:'dd/MM HH:mm' }}</p>
              <p class="text-[var(--ic-graphite)]">{{ m.message }}</p>
            </div>
            <div class="flex gap-2 pt-1">
              <input type="text" [(ngModel)]="draftMessage" placeholder="Message the provider…" class="flex-1 px-2 py-1.5 text-[11px] border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
              <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-forest)] text-[var(--ic-ivory)] disabled:opacity-40" [disabled]="!draftMessage.trim()" (click)="sendMessage()">Send</button>
            </div>
          </div>

          <!-- Notes -->
          <div *ngIf="activeTab() === 'notes'" class="space-y-2">
            <div *ngFor="let n of c.notes" class="p-2 rounded-1.5 bg-[var(--ic-warm-gray-100)]">
              <p class="text-[10px] font-semibold text-[var(--ic-warm-gray-600)]">{{ n.author }} · {{ n.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
              <p class="text-[var(--ic-graphite)]">{{ n.message }}</p>
            </div>
            <div class="flex gap-2 pt-1">
              <input type="text" [(ngModel)]="draftNote" placeholder="Add an internal note…" class="flex-1 px-2 py-1.5 text-[11px] border border-[var(--ic-warm-gray-300)] rounded-1.5 bg-[var(--ic-ivory)] focus:outline-none focus:ring-1 focus:ring-[var(--ic-forest)]" />
              <button type="button" class="px-2.5 py-1 rounded-1.5 text-[11px] font-semibold bg-[var(--ic-forest)] text-[var(--ic-ivory)] disabled:opacity-40" [disabled]="!draftNote.trim()" (click)="addNote()">Add</button>
            </div>
          </div>

          <!-- Audit Logs -->
          <div *ngIf="activeTab() === 'audit'" class="space-y-2">
            <div *ngFor="let a of c.auditLogs" class="flex items-start gap-2">
              <boo-icon name="history" [size]="13" iconClass="text-[var(--ic-warm-gray-400)] mt-0.5"></boo-icon>
              <div>
                <p class="text-[var(--ic-graphite)]">{{ a.action }} <span class="text-[var(--ic-warm-gray-500)]">by {{ a.actor }}</span></p>
                <p class="text-[10px] text-[var(--ic-warm-gray-500)]">{{ a.occurredAt | date:'dd/MM/yyyy HH:mm' }}<span *ngIf="a.details"> · {{ a.details }}</span></p>
              </div>
            </div>
          </div>
        </div>
      </ng-container>
    </section>
  `,
})
export class InsuranceClaimDetailPanelComponent implements OnChanges {
  @Input() claim: InsuranceClaimDetail | null = null;

  @Output() closeRequested = new EventEmitter<void>();
  @Output() actionRequested = new EventEmitter<ClaimActionMode>();
  @Output() noteAdded = new EventEmitter<string>();
  @Output() messageSent = new EventEmitter<string>();

  activeTab = signal<InspectorTab>('overview');
  selectedDoc: ClaimDocument | null = null;
  dragOver = false;
  draftNote = '';
  draftMessage = '';

  readonly tabs: { key: InspectorTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents' },
    { key: 'medical', label: 'Medical Records' },
    { key: 'billing', label: 'Billing' },
    { key: 'timeline', label: 'Approval Timeline' },
    { key: 'communication', label: 'Communication' },
    { key: 'notes', label: 'Notes' },
    { key: 'audit', label: 'Audit Logs' },
  ];

  ngOnChanges(): void {
    this.selectedDoc = null;
    this.dragOver = false;
  }

  get canSubmit(): boolean {
    return !!this.claim && ['Draft', 'ReadyToSubmit', 'NeedCorrection'].includes(this.claim.status);
  }
  get canApprove(): boolean {
    return !!this.claim && ['Submitted', 'UnderReview'].includes(this.claim.status);
  }
  get canReject(): boolean {
    return !!this.claim && ['Submitted', 'UnderReview'].includes(this.claim.status);
  }
  get canAppeal(): boolean {
    return this.claim?.status === 'Rejected';
  }
  get canSettle(): boolean {
    return this.claim?.status === 'Approved';
  }

  docTone(status: DocumentStatus): BadgeTone {
    return DOC_STATUS_TONE[status];
  }

  docIcon(d: ClaimDocument): string {
    switch (d.type) {
      case 'Image': return 'image';
      case 'Scan': return 'scan-line';
      case 'MedicalReport': return 'file-heart';
      case 'ClaimForm': return 'file-text';
      default: return 'file-text';
    }
  }

  onDragOver(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = true;
  }

  onDrop(ev: DragEvent): void {
    ev.preventDefault();
    this.dragOver = false;
    this.actionRequested.emit('upload');
  }

  formatAmount(n: number): string {
    return n.toLocaleString('vi-VN') + ' ₫';
  }

  addNote(): void {
    if (!this.draftNote.trim()) return;
    this.noteAdded.emit(this.draftNote.trim());
    this.draftNote = '';
  }

  sendMessage(): void {
    if (!this.draftMessage.trim()) return;
    this.messageSent.emit(this.draftMessage.trim());
    this.draftMessage = '';
  }

  print(): void {
    window.print();
  }
}
