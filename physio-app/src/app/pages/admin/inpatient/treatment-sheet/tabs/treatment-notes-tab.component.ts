import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooSelectComponent } from "../../../../../components/select/boo-select/boo-select.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { EmptyStateComponent } from "../../../../../components/ui/empty-state.component";
import { BadgeTone, StatusBadgeComponent } from "../../../../../components/ui/status-badge.component";
import { TreatmentSheetService } from "../../../../../services/admin/treatment-sheet.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { ProgressNoteType, TreatmentProgressNote } from "../../../../../shared/types/treatment-sheet.types";

@Component({
  selector: 'treatment-notes-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooSelectComponent, BooTextareaComponent, StatusBadgeComponent, EmptyStateComponent],
  template: `
    <div class="bg-surface border border-gray-200 rounded-lg p-4 mb-4">
      <h3 class="text-sm font-semibold text-primary mb-3">Add Progress Note</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <boo-select label="Note Type" [(ngModel)]="form.type" [options]="typeOptions" bindLabel="label" bindValue="value"></boo-select>
        <boo-textarea label="Note Content" [(ngModel)]="form.content" [rows]="3" class="md:col-span-3"></boo-textarea>
      </div>
      <div class="flex justify-end mt-3">
        <button (click)="submit()" [disabled]="loadingSrv.isLoading('note-add')" class="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50">
          Add Note
        </button>
      </div>
    </div>

    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading() && !notes().length"><boo-empty-state icon="file-text" title="No progress notes"></boo-empty-state></div>

    <div *ngIf="!isLoading() && notes().length" class="space-y-3">
      <div *ngFor="let n of notes()" class="border-l-4 pl-4 py-2" [ngClass]="borderClass(n.type)">
        <div class="flex items-center justify-between">
          <boo-status-badge [label]="n.type" [tone]="typeTone(n.type)"></boo-status-badge>
          <span class="text-xs text-secondary">{{ n.writtenAt | date:'short' }} · {{ n.authorName }}</span>
        </div>
        <p class="text-sm text-gray-800 mt-1">{{ n.content }}</p>
      </div>
    </div>
  `,
})
export class TreatmentNotesTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  notes = signal<TreatmentProgressNote[]>([]);
  form: { type: ProgressNoteType; content: string } = { type: 'Nursing', content: '' };

  readonly typeOptions: { label: string; value: ProgressNoteType }[] = [
    { label: 'Nursing Note', value: 'Nursing' },
    { label: "Doctor's Note", value: 'Doctor' },
    { label: 'Consultation Note', value: 'Consultation' },
  ];

  constructor(private srv: TreatmentSheetService, private toastSrv: ToastService, protected loadingSrv: LocalLoadingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getNotes(this.patientId).subscribe({
      next: (res) => { if (res.success) this.notes.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  submit(): void {
    if (!this.form.content.trim()) {
      this.toastSrv.error('Please enter note content');
      return;
    }
    this.loadingSrv.setLoading('note-add', true);
    this.srv.addNote(this.patientId, this.form.type, this.form.content).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading('note-add', false);
        if (res.success) {
          this.notes.set([res.data, ...this.notes()]);
          this.toastSrv.success('Note added');
          this.form = { type: 'Nursing', content: '' };
        } else {
          this.toastSrv.error('Unable to add note');
        }
      },
      error: () => { this.loadingSrv.setLoading('note-add', false); this.toastSrv.error('Unable to add note'); },
    });
  }

  typeTone(type: ProgressNoteType): BadgeTone {
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
