import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { Subject, debounceTime } from "rxjs";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { RadiologyService } from "../../../../../services/admin/radiology.service";
import { DialogService } from "../../../../../services/common/dialog.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ImagingOrderRow, RadiologyReport, RadiologyReportTemplate, ReportStatus } from "../../../../../shared/types/radiology.types";

@Component({
  selector: 'radiology-reporting-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooSelectComponent, BooTextareaComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !orders().length">
      <boo-empty-state icon="file-edit" title="No studies awaiting reporting or verification"></boo-empty-state>
    </div>

    <div *ngIf="!isLoading() && orders().length" class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Order list -->
      <div class="bg-surface border border-gray-200 rounded-lg overflow-hidden lg:col-span-1">
        <div class="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">Reports</div>
        <div class="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          <button *ngFor="let o of orders()" type="button" (click)="selectOrder(o)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
            [ngClass]="selectedOrder()?.id === o.id ? 'bg-primary/5' : ''">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-medium text-gray-800 truncate">{{ o.patientName }}</span>
              <boo-status-badge [label]="o.reportStatus" [tone]="reportStatusTone(o.reportStatus)"></boo-status-badge>
            </div>
            <div class="text-xs text-gray-500">{{ o.orderNumber }} · {{ examNames(o) }}</div>
          </button>
        </div>
      </div>

      <!-- Report editor + verification -->
      <div class="lg:col-span-2 space-y-4" *ngIf="report()">
        <div class="bg-surface border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-gray-800">Report — {{ report()!.orderNumber }}</h3>
            <span class="text-xs text-gray-400">{{ saveStatus() }}</span>
          </div>

          <div class="flex flex-wrap items-center gap-3 mb-4">
            <boo-select label="Template / Favorite" [(ngModel)]="selectedTemplateId" [options]="templateOptions()" bindLabel="label" bindValue="value" (ngModelChange)="applyTemplate($event)"></boo-select>
            <button type="button" (click)="toggleDictation()" [disabled]="!dictationSupported || report()?.status === 'Verified'"
              [title]="dictationSupported ? 'Dictate into Findings' : 'Voice dictation needs a browser with speech recognition (Chrome or Edge)'"
              class="px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 disabled:cursor-not-allowed disabled:text-gray-400 disabled:bg-gray-50"
              [ngClass]="dictating() ? 'border-red-300 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 bg-surface hover:bg-gray-50'">
              <boo-icon [name]="dictating() ? 'mic-off' : 'mic'" [size]="14"></boo-icon> {{ dictating() ? 'Stop dictation' : 'Voice dictation' }}
            </button>
          </div>

          <div class="space-y-3">
            <boo-textarea label="Clinical Indication" [rows]="2" [(ngModel)]="report()!.clinicalIndication" (ngModelChange)="onFieldChange()"></boo-textarea>
            <boo-textarea label="Examination Technique" [rows]="2" [(ngModel)]="report()!.technique" (ngModelChange)="onFieldChange()"></boo-textarea>
            <boo-textarea label="Findings" [rows]="4" [(ngModel)]="report()!.findings" (ngModelChange)="onFieldChange()"></boo-textarea>
            <boo-textarea label="Impression" [rows]="3" [(ngModel)]="report()!.impression" (ngModelChange)="onFieldChange()"></boo-textarea>
            <boo-textarea label="Recommendations" [rows]="2" [(ngModel)]="report()!.recommendations" (ngModelChange)="onFieldChange()"></boo-textarea>
            <label class="flex items-center gap-2 text-sm text-gray-700 select-none">
              <input type="checkbox" class="rounded border-gray-300" [(ngModel)]="report()!.isCritical" (ngModelChange)="onFieldChange()" />
              Critical finding (alerts the ordering clinician when the report is approved)
            </label>
          </div>

          <div class="mt-3" *ngIf="report()!.attachments.length">
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-1">Attachments</h4>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let a of report()!.attachments" class="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{{ a }}</span>
            </div>
          </div>
        </div>

        <!-- Verification -->
        <div class="bg-surface border border-gray-200 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-800 mb-3">Verification</h3>
          <div class="grid grid-cols-2 gap-3 text-sm mb-4">
            <div><span class="text-gray-500">Reporting Radiologist</span><div class="font-medium text-gray-800">{{ report()!.reportingRadiologistName ?? 'Unassigned' }}</div></div>
            <div><span class="text-gray-500">Verifying Radiologist</span><div class="font-medium text-gray-800">{{ report()!.verifyingRadiologistName ?? '—' }}</div></div>
            <div><span class="text-gray-500">Status</span><div><boo-status-badge [label]="report()!.status" [tone]="reportStatusTone(report()!.status)"></boo-status-badge></div></div>
            <div><span class="text-gray-500">Verified At</span><div class="font-medium text-gray-800">{{ report()!.verifiedAt ? (report()!.verifiedAt | date:'medium') : '—' }}</div></div>
          </div>
          <div class="flex gap-2">
            <button (click)="approve()" class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700">Approve</button>
            <button (click)="reject()" class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700">Reject</button>
            <button (click)="returnForRevision()" class="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600">Return for Revision</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RadiologyReportingTabComponent implements OnInit, OnDestroy {
  isLoading = signal(true);
  orders = signal<ImagingOrderRow[]>([]);
  selectedOrder = signal<ImagingOrderRow | null>(null);
  report = signal<RadiologyReport | null>(null);
  templates = signal<RadiologyReportTemplate[]>([]);
  saveStatus = signal('');
  selectedTemplateId: string | null = null;

  private fieldChange$ = new Subject<void>();

  constructor(private srv: RadiologyService, private toastSrv: ToastService, private dialogSrv: DialogService) { }

  ngOnInit(): void {
    this.fieldChange$.pipe(debounceTime(800)).subscribe(() => this.autoSave());

    this.srv.getOrders().subscribe({
      next: (res) => {
        if (res.success) {
          const reportable = res.data.items.filter(o => o.reportStatus !== 'NotStarted');
          this.orders.set(reportable);
          if (reportable.length) this.selectOrder(reportable[0]);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });

    this.srv.getReportTemplates().subscribe(res => { if (res.success) this.templates.set(res.data); });
  }

  // #region Voice dictation (browser Web Speech API; text is appended to Findings)
  private recognition: any = null;
  readonly dictationSupported = typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  dictating = signal(false);

  toggleDictation(): void {
    if (this.dictating()) { this.recognition?.stop(); return; }
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition || !this.report()) return;

    this.recognition = new Recognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = navigator.language || 'en-US';
    this.recognition.onresult = (event: any) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) text += event.results[i][0].transcript;
      }
      if (!text.trim()) return;
      this.report.update(r => r ? { ...r, findings: `${r.findings ? r.findings.trimEnd() + ' ' : ''}${text.trim()}` } : r);
      this.onFieldChange();
    };
    this.recognition.onerror = () => this.toastSrv.error('Dictation stopped: microphone unavailable or permission denied');
    this.recognition.onend = () => this.dictating.set(false);
    this.recognition.start();
    this.dictating.set(true);
  }
  // #endregion

  ngOnDestroy(): void {
    this.recognition?.stop();
    this.fieldChange$.complete();
  }

  templateOptions(): { label: string; value: string | null }[] {
    return [
      { label: 'No template', value: null },
      ...this.templates().map(t => ({ label: t.isFavorite ? `★ ${t.name}` : t.name, value: t.id })),
    ];
  }

  selectOrder(order: ImagingOrderRow): void {
    this.selectedOrder.set(order);
    this.selectedTemplateId = null;
    this.srv.getReport(order.id).subscribe(res => {
      if (res.success) this.report.set(res.data);
    });
  }

  examNames(o: ImagingOrderRow): string {
    return o.examinations.map(e => e.examinationName).join(', ');
  }

  applyTemplate(templateId: string | null): void {
    const tpl = this.templates().find(t => t.id === templateId);
    if (!tpl || !this.report()) return;
    this.report.update(r => r ? {
      ...r,
      clinicalIndication: tpl.clinicalIndication,
      technique: tpl.technique,
      findings: tpl.findings,
      impression: tpl.impression,
      recommendations: tpl.recommendations,
    } : r);
    this.onFieldChange();
  }

  onFieldChange(): void {
    this.fieldChange$.next();
  }

  autoSave(): void {
    const r = this.report();
    if (!r) return;
    this.saveStatus.set('Saving…');
    this.srv.saveReportDraft(r.orderId, r).subscribe(res => {
      if (res.success) this.saveStatus.set(`Saved ${new Date().toLocaleTimeString()}`);
      else this.saveStatus.set('Save failed');
    });
  }

  reportStatusTone(status: ReportStatus): BadgeTone {
    switch (status) {
      case 'Released': case 'Verified': return 'success';
      case 'PendingVerification': case 'Reporting': return 'warning';
      case 'Rejected': case 'ReturnedForRevision': return 'danger';
      default: return 'neutral';
    }
  }

  approve(): void {
    const r = this.report();
    if (!r) return;
    this.srv.approveReport(r.orderId).subscribe(res => {
      if (!res.success) { this.toastSrv.error('Unable to approve report'); return; }
      this.report.update(rep => rep ? { ...rep, status: 'Verified', verifiedAt: new Date().toISOString() } : rep);
      this.toastSrv.success('Report approved');
    });
  }

  reject(): void {
    const r = this.report();
    if (!r) return;
    this.dialogSrv.confirm(
      'Reject this report? Provide a reason when prompted by your workflow.',
      () => {
        this.srv.rejectReport(r.orderId, 'Rejected by verifying radiologist').subscribe(res => {
          if (!res.success) { this.toastSrv.error('Unable to reject report'); return; }
          this.report.update(rep => rep ? { ...rep, status: 'Rejected' } : rep);
          this.toastSrv.success('Report rejected');
        });
      },
      'Reject Report',
      'danger',
      'Reject',
    );
  }

  returnForRevision(): void {
    const r = this.report();
    if (!r) return;
    this.dialogSrv.confirm(
      'Return this report to the reporting radiologist for revision?',
      () => {
        this.srv.returnReportForRevision(r.orderId, 'Returned for revision').subscribe(res => {
          if (!res.success) { this.toastSrv.error('Unable to return report'); return; }
          this.report.update(rep => rep ? { ...rep, status: 'ReturnedForRevision' } : rep);
          this.toastSrv.success('Report returned for revision');
        });
      },
      'Return for Revision',
      'warning',
      'Return',
    );
  }
}
