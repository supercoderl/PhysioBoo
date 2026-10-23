import { DatePipe, NgFor, NgIf } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  BooBadgeTone, BooButtonComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent,
  BooPaginationComponent, BooStatusBadgeComponent
} from '@physioboo/ui';
import { finalize } from "rxjs";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { NursingNote } from "../../../../../shared/types/nursing.types";

const MAX_NOTE_LENGTH = 4000;

@Component({
  selector: 'nursing-notes-tab',
  standalone: true,
  imports: [
    NgIf, NgFor, DatePipe, FormsModule,
    BooButtonComponent, BooTextareaComponent, BooEmptyStateComponent, BooErrorStateComponent, BooInlineErrorComponent,
    BooPaginationComponent, BooStatusBadgeComponent,
  ],
  template: `
    <div *ngIf="loading()" aria-hidden="true" class="h-48 rounded-xl border border-borderGray bg-surface animate-pulse"></div>
    <span *ngIf="loading()" class="sr-only" role="status">Loading notes…</span>

    <boo-error-state *ngIf="!loading() && error() && !notes().length" appearance="panel" [headingLevel]="3"
      title="We couldn't load the notes" description="Check your connection and try again." retryLabel="Try again" (retry)="load()" />

    <div *ngIf="!loading() && (!error() || notes().length)" class="flex flex-col gap-4 max-w-3xl">
      <boo-inline-error *ngIf="error()" what="the notes" (retry)="load()" />

      <form *ngIf="canWrite" (ngSubmit)="submit()" class="bg-surface border border-borderGray rounded-xl p-4 flex flex-col gap-2">
        <boo-textarea label="Add a nursing note" name="note" [rows]="3" [maxlength]="maxLength" [(ngModel)]="draft" />
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs text-secondary tabular-nums">{{ draft.length }} / {{ maxLength }}</span>
          <button type="submit" boo-button variant="primary" size="sm" [loading]="saving" [disabled]="!draft.trim()">Add note</button>
        </div>
      </form>

      <h2 class="m-0 text-sm font-semibold text-regular">Clinical notes</h2>

      <boo-empty-state *ngIf="!notes().length" icon="file-text" title="No notes yet"
        [description]="canWrite ? 'Add the first nursing note for this patient.' : 'No notes have been written for this patient.'" />

      <ul *ngIf="notes().length" class="m-0 p-0 list-none flex flex-col gap-3">
        <li *ngFor="let n of notes(); trackBy: trackById" class="bg-surface border border-borderGray rounded-xl p-4">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
            <span class="flex items-center gap-2 text-sm font-semibold text-regular">
              {{ n.writtenBy }}
              <boo-status-badge [label]="typeLabel(n.type)" [tone]="typeTone(n.type)" />
            </span>
            <span class="text-xs text-secondary tabular-nums">{{ n.time | date: 'MMM d, y, HH:mm' }}</span>
          </div>
          <p class="m-0 text-sm text-regular whitespace-pre-wrap break-words">{{ n.content }}</p>
        </li>
      </ul>

      <boo-pagination *ngIf="totalPages > 1" [page]="page" [totalPages]="totalPages" (pageChange)="goTo($event)" />
    </div>
  `,
})
export class NursingNotesTabComponent implements OnChanges {
  // #region Inputs, Outputs, Properties
  @Input({ required: true }) patientId!: string;
  @Input() refreshKey = 0;
  @Input() canWrite = false;

  private readonly srv = inject(NursingService);
  private readonly toastSrv = inject(ToastService);

  readonly maxLength = MAX_NOTE_LENGTH;
  loading = signal(true);
  error = signal(false);
  notes = signal<NursingNote[]>([]);
  page = 1;
  totalPages = 1;
  draft = '';
  saving = false;
  // #endregion

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.patientId) return;
    if (changes['patientId']) this.page = 1;
    if (changes['patientId'] || changes['refreshKey']) this.load();
  }

  load(): void {
    if (!this.notes().length) this.loading.set(true);
    this.error.set(false);
    const requested = this.patientId;
    this.srv.getNotes(requested, this.page).pipe(finalize(() => this.loading.set(false))).subscribe({
      next: res => {
        if (requested !== this.patientId) return;
        if (!res.success) { this.error.set(true); return; }
        this.notes.set(res.data.items);
        this.totalPages = res.data.totalPages || 1;
      },
      error: () => this.error.set(true),
    });
  }

  goTo(page: number): void {
    if (page === this.page) return;
    this.page = page;
    this.load();
  }

  submit(): void {
    const content = this.draft.trim();
    if (!content || this.saving) return;
    this.saving = true;
    this.srv.addNote(this.patientId, content).pipe(finalize(() => this.saving = false)).subscribe({
      next: res => {
        // On failure the draft stays in the box.
        if (!res.success) { this.toastSrv.error('Unable to add the note'); return; }
        this.draft = '';
        this.toastSrv.success('Note added');
        this.page = 1;
        this.load();
      },
    });
  }

  typeLabel(type: NursingNote['type']): string {
    switch (type) {
      case 'doctor': return 'Doctor';
      case 'nursing': return 'Nursing';
      default: return 'General';
    }
  }

  typeTone(type: NursingNote['type']): BooBadgeTone {
    switch (type) {
      case 'doctor': return 'primary';
      case 'nursing': return 'success';
      default: return 'neutral';
    }
  }

  trackById = (_: number, item: { id: string }) => item.id;
}
