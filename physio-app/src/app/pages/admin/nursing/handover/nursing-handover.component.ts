import { DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooIconComponent, BooInlineErrorComponent,
  BooInlineErrorState, BooSearchFieldComponent, BooStatusBadgeComponent
} from '@physioboo/ui';
import { Subscription, finalize } from 'rxjs';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { NursingService } from '../../../../services/admin/nursing.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { ShiftCode, ShiftHandoverCard } from '../../../../shared/types/nursing.types';
import { DashboardKpi, DashboardKpiTileComponent } from '../../overview/dashboard/sections/dashboard-kpi-tile.component';
import { DashboardPanelComponent } from '../../overview/dashboard/sections/dashboard-panel.component';

type LoadError = 'forbidden' | 'failed';
type SbarKey = 'situation' | 'background' | 'assessment' | 'recommendation';
type SbarDraft = Record<SbarKey, string>;
type StatusFilter = 'Pending' | 'Acknowledged' | null;

/** Server limit of every SBAR section (UpdateHandoverCommandValidation). */
const SBAR_MAX_LENGTH = 2000;

@Component({
  selector: 'admin-nursing-handover',
  standalone: true,
  imports: [
    NgIf, NgFor, NgTemplateOutlet, DatePipe, FormsModule, RouterLink,
    BooButtonComponent, BooIconComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent,
    BooStatusBadgeComponent, BooSearchFieldComponent, BooSelectComponent, BooTextareaComponent,
    DashboardKpiTileComponent, DashboardPanelComponent,
  ],
  templateUrl: './nursing-handover.component.html',
})
export class AdminNursingHandoverComponent implements OnInit {
  // #region Inputs, Outputs, Properties
  private readonly nursingSrv = inject(NursingService);
  private readonly authSrv = inject(AuthService);
  private readonly dialogSrv = inject(DialogService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private loadSub?: Subscription;

  /** The shift handing over; the cards are addressed to the shift that follows it. */
  outgoingShift: ShiftCode = 'Day';
  /** Null until the first successful load of the selected shift. */
  cards: ShiftHandoverCard[] | null = null;

  loading = false;
  loadError: LoadError | null = null;
  /** A refresh failed while older cards are still on screen. */
  refreshFailed = false;
  refreshErrorState: BooInlineErrorState = 'default';
  updatedAt: Date | null = null;

  search = '';
  statusFilter: StatusFilter = null;

  canWrite = false;

  editingId: string | null = null;
  draft: SbarDraft = this.emptyDraft();
  /** Shown only after a save attempt, so the form is not flagged before the nurse has typed anything. */
  showDraftErrors = false;
  savingId: string | null = null;
  acknowledgingIds = new Set<string>();

  readonly skeletonRows = Array.from({ length: 3 });
  readonly maxLength = SBAR_MAX_LENGTH;
  readonly shiftOptions: { label: string; value: ShiftCode }[] = [
    { label: 'Day shift', value: 'Day' },
    { label: 'Evening shift', value: 'Evening' },
    { label: 'Night shift', value: 'Night' },
  ];
  readonly statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'All cards', value: null },
    { label: 'To acknowledge', value: 'Pending' },
    { label: 'Acknowledged', value: 'Acknowledged' },
  ];
  readonly sbarFields: { key: SbarKey; label: string }[] = [
    { key: 'situation', label: 'Situation' },
    { key: 'background', label: 'Background' },
    { key: 'assessment', label: 'Assessment' },
    { key: 'recommendation', label: 'Recommendation' },
  ];
  // #endregion

  ngOnInit(): void {
    // Permissions arrive with the profile; the actions follow them if they load after the page.
    this.authSrv.permissions$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(perms => this.canWrite = (perms ?? []).includes(Permissions.Inpatient.NursingWrite));
    this.load();
  }

  // #region Derived data
  get incomingShift(): ShiftCode {
    return this.outgoingShift === 'Day' ? 'Evening' : this.outgoingShift === 'Evening' ? 'Night' : 'Day';
  }

  get pendingCards(): ShiftHandoverCard[] {
    return this.visibleCards.filter(c => !c.acknowledged);
  }

  get acknowledgedCards(): ShiftHandoverCard[] {
    return this.visibleCards.filter(c => c.acknowledged);
  }

  get visibleCards(): ShiftHandoverCard[] {
    const q = this.search.trim().toLowerCase();
    return (this.cards ?? []).filter(c =>
      (!q || c.patientName.toLowerCase().includes(q) || c.bedNumber.toLowerCase().includes(q))
      && (this.statusFilter !== 'Pending' || !c.acknowledged)
      && (this.statusFilter !== 'Acknowledged' || c.acknowledged)
    );
  }

  get hasFilters(): boolean {
    return !!(this.search.trim() || this.statusFilter);
  }

  get kpis(): DashboardKpi[] {
    const all = this.cards ?? [];
    const pending = all.filter(c => !c.acknowledged).length;
    return [
      { key: 'total', label: 'Handover cards', icon: 'clipboard-list', value: `${all.length}`, detail: `${this.outgoingShift} → ${this.incomingShift} shift` },
      { key: 'pending', label: 'To acknowledge', icon: 'clock', value: `${pending}`, detail: 'Waiting for the incoming nurse', tone: pending > 0 ? 'attention' : 'default' },
      { key: 'done', label: 'Acknowledged', icon: 'check', value: `${all.length - pending}`, detail: 'Locked against edits' },
    ];
  }

  /** Whether the draft being edited differs from the saved card. */
  get draftDirty(): boolean {
    const card = this.cards?.find(c => c.id === this.editingId);
    return !!card && this.sbarFields.some(f => this.draft[f.key] !== card[f.key]);
  }

  draftError(key: SbarKey): string | null {
    if (!this.showDraftErrors) return null;
    const value = this.draft[key];
    const label = this.sbarFields.find(f => f.key === key)!.label;
    if (!value.trim()) return `${label} is required.`;
    if (value.length > SBAR_MAX_LENGTH) return `${label} may not exceed ${SBAR_MAX_LENGTH} characters.`;
    return null;
  }
  // #endregion

  // #region Loading
  load(): void {
    this.loadSub?.unsubscribe();
    const retryingAfterError = !!this.cards && this.refreshFailed;
    this.loading = true;
    if (retryingAfterError) this.refreshErrorState = 'retrying';

    const shift = this.outgoingShift;
    this.loadSub = this.nursingSrv.getHandoverCards(shift, null, true)
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success) { this.onLoadFailed(0, retryingAfterError); return; }
          this.cards = res.data ?? [];
          this.loadError = null;
          this.refreshFailed = false;
          this.refreshErrorState = 'default';
          this.updatedAt = new Date();
          // An open edit survives a refresh only while its card is still unacknowledged.
          if (this.editingId && this.cards.find(c => c.id === this.editingId)?.acknowledged !== false) this.stopEditing();
        },
        error: (err: HttpErrorResponse) => this.onLoadFailed(err?.status ?? 0, retryingAfterError),
      });
  }

  private onLoadFailed(status: number, retryingAfterError: boolean): void {
    if (this.cards) {
      this.refreshFailed = true;
      this.refreshErrorState = retryingAfterError ? 'failed' : 'default';
    } else {
      this.loadError = status === 403 ? 'forbidden' : 'failed';
    }
  }

  onShiftChange(shift: ShiftCode): void {
    if (shift === this.outgoingShift) return;
    // The select is disabled while a card is being edited, so no draft can be lost here.
    this.outgoingShift = shift;
    // Another shift's cards would be misleading under the new heading, so start from scratch.
    this.cards = null;
    this.loadError = null;
    this.refreshFailed = false;
    this.updatedAt = null;
    this.search = '';
    this.statusFilter = null;
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = null;
  }
  // #endregion

  // #region Editing
  startEdit(card: ShiftHandoverCard): void {
    const begin = () => {
      this.draft = { situation: card.situation, background: card.background, assessment: card.assessment, recommendation: card.recommendation };
      this.showDraftErrors = false;
      this.editingId = card.id;
    };
    if (this.editingId && this.editingId !== card.id && this.draftDirty) {
      this.dialogSrv.confirmUnsavedChanges(begin);
      return;
    }
    begin();
  }

  cancelEdit(): void {
    if (this.draftDirty) {
      this.dialogSrv.confirmUnsavedChanges(() => this.stopEditing());
      return;
    }
    this.stopEditing();
  }

  saveEdit(card: ShiftHandoverCard): void {
    if (this.savingId) return;
    this.showDraftErrors = true;
    if (this.sbarFields.some(f => this.draftError(f.key))) {
      this.toastSrv.error('Complete every SBAR section before saving');
      return;
    }
    this.savingId = card.id;
    this.nursingSrv.updateHandover(card.id, {
      situation: this.draft.situation.trim(),
      background: this.draft.background.trim(),
      assessment: this.draft.assessment.trim(),
      recommendation: this.draft.recommendation.trim(),
    })
      .pipe(finalize(() => this.savingId = null), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          // On failure the draft stays as typed so the nurse can retry.
          if (!res.success || !res.data) { this.toastSrv.error('Unable to update the handover'); return; }
          this.replaceCard(res.data);
          this.stopEditing();
          this.toastSrv.success('Handover updated');
        },
        error: () => this.toastSrv.error('Unable to update the handover'),
      });
  }

  private stopEditing(): void {
    this.editingId = null;
    this.showDraftErrors = false;
    this.draft = this.emptyDraft();
  }
  // #endregion

  // #region Acknowledge
  confirmAcknowledge(card: ShiftHandoverCard): void {
    this.dialogSrv.confirm(
      `Acknowledge the handover for ${card.patientName} (bed ${card.bedNumber})? It is recorded under your name and the card can no longer be edited.`,
      () => this.acknowledge(card),
      'Acknowledge handover',
      'warning',
      'Acknowledge',
    );
  }

  private acknowledge(card: ShiftHandoverCard): void {
    if (this.acknowledgingIds.has(card.id)) return;
    this.acknowledgingIds = new Set(this.acknowledgingIds).add(card.id);

    this.nursingSrv.acknowledgeHandover(card.id)
      .pipe(
        finalize(() => {
          const next = new Set(this.acknowledgingIds);
          next.delete(card.id);
          this.acknowledgingIds = next;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          if (!res.success || !res.data) { this.toastSrv.error('Unable to acknowledge the handover'); return; }
          this.replaceCard(res.data);
          if (this.editingId === card.id) this.stopEditing();
          this.toastSrv.success('Handover acknowledged');
        },
        error: () => this.toastSrv.error('Unable to acknowledge the handover'),
      });
  }
  // #endregion

  // #region Helpers
  private replaceCard(updated: ShiftHandoverCard): void {
    this.cards = (this.cards ?? []).map(c => c.id === updated.id ? updated : c);
  }

  private emptyDraft(): SbarDraft {
    return { situation: '', background: '', assessment: '', recommendation: '' };
  }

  trackById = (_: number, item: { id: string }) => item.id;
  trackByKey = (_: number, item: { key: string }) => item.key;
  // #endregion
}
