import { Component, OnInit, signal } from "@angular/core";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { BooSelectComponent } from "../../../../components/select/boo-select/boo-select.component";
import { ErrorStateComponent } from "../../../../components/ui/error-state.component";
import { NursingService } from "../../../../services/admin/nursing.service";
import { LocalLoadingService } from "../../../../services/common/local-loading.service";
import { ToastService } from "../../../../services/common/toast.service";
import { SharedModule } from "../../../../shared/shared-imports";
import { ShiftCode, ShiftHandoverCard } from "../../../../shared/types/nursing.types";

@Component({
    selector: 'admin-nursing-handover',
    standalone: true,
    imports: [SharedModule, BooIconComponent, BooSelectComponent, ErrorStateComponent],
    template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">Shift Handover</h2>
            <p class="text-gray-600">SBAR handover from outgoing to incoming shift</p>
          </div>
          <boo-select label="Outgoing Shift" [(ngModel)]="outgoingShift" (ngModelChange)="load()" [options]="shiftOptions" bindLabel="label" bindValue="value"></boo-select>
        </div>

        <div *ngIf="loadingSrv.isLoading('handover')" class="flex flex-col items-center justify-center py-24 gap-3">
          <boo-icon name="loader" [size]="32" class="animate-spin text-primary"></boo-icon>
          <span class="text-gray-500 text-sm">Loading handover...</span>
        </div>

        <div *ngIf="!loadingSrv.isLoading('handover') && error()">
          <boo-error-state title="Couldn't load handover" [description]="error()" (retry)="retryLoad()"></boo-error-state>
        </div>

        <div *ngIf="!loadingSrv.isLoading('handover') && !error() && cards.length === 0" class="bg-surface rounded-lg shadow-md p-12 flex flex-col items-center justify-center text-center">
          <boo-icon name="inbox" [size]="36" class="text-gray-300 mb-3"></boo-icon>
          <p class="text-gray-500 text-sm">No handover cards for this shift.</p>
        </div>

        <div *ngIf="!loadingSrv.isLoading('handover') && !error() && cards.length > 0" class="space-y-4">
          <div *ngFor="let c of cards" class="bg-surface rounded-lg shadow-md p-5">
            <div class="flex items-center justify-between mb-3">
              <div>
                <span class="font-semibold text-gray-800">{{ c.patientName }}</span>
                <span class="text-xs text-gray-500 ml-2">Bed {{ c.bedNumber }} · {{ c.outgoingShift }} → {{ c.incomingShift }}</span>
              </div>
              <span *ngIf="c.acknowledged" class="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <boo-icon name="check-circle" [size]="14"></boo-icon> Acknowledged
              </span>
            </div>
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><dt class="text-xs text-gray-500 mb-0.5">Situation</dt><dd class="text-gray-800 m-0">{{ c.situation }}</dd></div>
              <div><dt class="text-xs text-gray-500 mb-0.5">Background</dt><dd class="text-gray-800 m-0">{{ c.background }}</dd></div>
              <div><dt class="text-xs text-gray-500 mb-0.5">Assessment</dt><dd class="text-gray-800 m-0">{{ c.assessment }}</dd></div>
              <div><dt class="text-xs text-gray-500 mb-0.5">Recommendation</dt><dd class="text-gray-800 m-0">{{ c.recommendation }}</dd></div>
            </dl>
            <div class="mt-4 flex justify-end" *ngIf="!c.acknowledged">
              <button (click)="acknowledge(c)" [disabled]="loadingSrv.isLoading('ack-' + c.id)"
                class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `
})
export class AdminNursingHandoverComponent implements OnInit {
    cards: ShiftHandoverCard[] = [];
    error = signal<string | null>(null);
    outgoingShift: ShiftCode = 'Day';

    shiftOptions: { label: string; value: ShiftCode }[] = [
        { label: 'Day', value: 'Day' },
        { label: 'Evening', value: 'Evening' },
        { label: 'Night', value: 'Night' },
    ];

    constructor(
        private srv: NursingService,
        private toastSrv: ToastService,
        protected loadingSrv: LocalLoadingService,
    ) { }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.error.set(null);
        this.loadingSrv.setLoading('handover', true);
        this.srv.getHandoverCards(this.outgoingShift).subscribe({
            next: (res) => {
                this.loadingSrv.setLoading('handover', false);
                if (res.success) this.cards = res.data;
            },
            error: () => {
                this.loadingSrv.setLoading('handover', false);
                this.error.set('Failed to load handover cards. Please try again.');
            },
        });
    }

    retryLoad(): void { this.load(); }

    acknowledge(card: ShiftHandoverCard): void {
        const key = 'ack-' + card.id;
        this.loadingSrv.setLoading(key, true);
        this.srv.acknowledgeHandover(card.id, 'You').subscribe({
            next: (res) => {
                this.loadingSrv.setLoading(key, false);
                if (res.success) {
                    this.cards = this.cards.map(c => c.id === card.id ? { ...c, acknowledged: true, acknowledgedBy: 'You' } : c);
                    this.toastSrv.success('Handover acknowledged');
                } else {
                    this.toastSrv.error('Unable to acknowledge handover');
                }
            },
            error: () => { this.loadingSrv.setLoading(key, false); this.toastSrv.error('Unable to acknowledge handover'); },
        });
    }
}
