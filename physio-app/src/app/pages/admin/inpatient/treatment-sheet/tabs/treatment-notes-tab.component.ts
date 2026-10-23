import { Component, EventEmitter, Input, OnChanges, Output, signal } from "@angular/core";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { BooBadgeTone, BooEmptyStateComponent, BooErrorStateComponent, BooStatusBadgeComponent } from '@physioboo/ui';
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ProgressNoteType, TreatmentProgressNote } from "../../../../../shared/types/treatment-sheet.types";
import { BooButtonAdminComponent } from "../../../../../components/button/boo-button-admin/boo-button-admin.component";

const NOTE_MAX_LENGTH = 4000;

@Component({
  selector: 'treatment-notes-tab',
  standalone: true,
  imports: [SharedModule, BooSelectComponent, BooTextareaComponent, BooStatusBadgeComponent, BooEmptyStateComponent, BooErrorStateComponent, BooButtonAdminComponent],
  template: `
    <form *ngIf="canWrite" (ngSubmit)="submit()" class="rounded-lg border border-dashed border-amber-400 bg-amber-50/40 p-4 mb-4" aria-label="Add a progress note">
      <div class="flex items-center gap-2 mb-3">
        <h3 class="text-sm font-semibold text-primary m-0">Add Progress Note</h3>
        <boo-status-badge *ngIf="isDirty()" label="Unsaved draft" tone="warning" [dotted]="true"></boo-status-badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <boo-select label="Note Type" required [(ngModel)]="form.type" name="type" [options]="typeOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-textarea label="Note Content" required [(ngModel)]="form.content" name="content" [rows]="3" [maxlength]="maxLength" class="md:col-span-3"></boo-textarea>
      </div>
      <p *ngIf="submitted() && validationMessage()" class="text-xs text-red-600 mt-2" role="alert">{{ validationMessage() }}</p>
      <div class="flex items-center justify-between mt-3">
        <span class="text-xs text-secondary">{{ form.content.length }} / {{ maxLength }}</span>
        <div class="flex gap-2">
          <boo-button-admin *ngIf="isDirty()" (click)="discardDraft()" [disabled]="saving()" background="transparent" textColor="#55434B" [border]="{ width: 1, color: '#E3D5DA' }" padding="8px 16px" [fontSize]="14" [radius]="8">Discard</boo-button-admin>
          <boo-button-admin (click)="submit()" [disabled]="saving()" [loading]="saving()" background="#EA580C" textColor="white" padding="8px 16px" [fontSize]="14" [radius]="8">
            {{ saving() ? 'Saving…' : 'Add Note' }}
          </boo-button-admin>
        </div>
      </div>
    </form>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16" aria-live="polite">
      <physio-icon name="loader" [class]="'w-6 h-6 text-primary animate-spin'"></physio-icon>
    </div>

    <boo-error-state *ngIf="!isLoading() && loadError()" title="Couldn't load progress notes" [description]="loadError()" appearance="panel" (retry)="load()"></boo-error-state>

    <ng-container *ngIf="!isLoading() && !loadError()">
      <div *ngIf="!notes().length"><boo-empty-state icon="file-text" title="No progress notes" description="Saved progress notes for this stay will appear here."></boo-empty-state></div>

      <div *ngIf="notes().length" class="space-y-3">
        <div *ngFor="let n of notes()" class="border-l-4 pl-4 py-2" [ngClass]="borderClass(n.type)">
          <div class="flex items-center justify-between">
            <boo-status-badge [label]="n.type" [tone]="typeTone(n.type)"></boo-status-badge>
            <span class="text-xs text-secondary">{{ n.writtenAt | date:'short' }} · {{ n.authorName }}</span>
          </div>
          <p class="text-sm text-gray-800 mt-1 whitespace-pre-line">{{ n.content }}</p>
        </div>
      </div>
      <p *ngIf="truncated()" class="text-xs text-secondary mt-3">Showing the {{ notes().length }} most recent of {{ total() }} notes.</p>
    </ng-container>
  `,
})
export class TreatmentNotesTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;
  @Input() canWrite = false;
  /** Emitted after a note was saved so the page can refresh its counters. */
  @Output() changed = new EventEmitter<void>();

  readonly maxLength = NOTE_MAX_LENGTH;

  isLoading = signal(true);
  loadError = signal<string | null>(null);
  notes = signal<TreatmentProgressNote[]>([]);
  total = signal(0);
  saving = signal(false);
  submitted = signal(false);
  form: { type: ProgressNoteType | null; content: string } = { type: null, content: '' };

  readonly typeOptions: { label: string; value: ProgressNoteType }[] = [
    { label: 'Nursing Note', value: 'Nursing' },
    { label: "Doctor's Note", value: 'Doctor' },
    { label: 'Consultation Note', value: 'Consultation' },
  ];

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService) { }

  ngOnChanges(): void {
    this.load();
  }

  load(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.loadError.set(null);
    this.srv.getNotes(this.patientId).subscribe({
      next: (res) => {
        if (res.success) {
          this.notes.set(res.data.items);
          this.total.set(res.data.totalCount);
        } else {
          this.loadError.set('The progress notes could not be loaded.');
        }
        this.isLoading.set(false);
      },
      error: () => { this.loadError.set('The progress notes could not be loaded.'); this.isLoading.set(false); },
    });
  }

  truncated(): boolean { return this.total() > this.notes().length; }

  isDirty(): boolean { return this.form.type !== null || this.form.content.length > 0; }

  discardDraft(): void {
    this.form = { type: null, content: '' };
    this.submitted.set(false);
  }

  validationMessage(): string | null {
    if (!this.form.type) return 'Choose the note type.';
    if (!this.form.content.trim()) return 'Enter the note content.';
    return null;
  }

  submit(): void {
    if (this.saving()) return;
    this.submitted.set(true);
    if (this.validationMessage()) return;

    this.saving.set(true);
    this.srv.addNote(this.patientId, this.form.type!, this.form.content.trim()).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.success && res.data) {
          this.notes.set([res.data, ...this.notes()]);
          this.total.update(t => t + 1);
          this.discardDraft();
          this.toastSrv.success('Note added');
          this.changed.emit();
        } else {
          this.toastSrv.error('Unable to add note');
        }
      },
      // The draft stays as typed so the user can retry.
      error: () => { this.saving.set(false); this.toastSrv.error('Unable to add note'); },
    });
  }

  typeTone(type: ProgressNoteType): BooBadgeTone {
    switch (type) {
      case 'Doctor': return 'success';
      case 'Consultation': return 'warning';
      default: return 'primary';
    }
  }

  borderClass(type: ProgressNoteType): string {
    switch (type) {
      case 'Doctor': return 'border-emerald-500';
      case 'Consultation': return 'border-amber-500';
      default: return 'border-primary';
    }
  }
}
