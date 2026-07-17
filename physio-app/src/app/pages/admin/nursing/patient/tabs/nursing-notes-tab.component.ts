import { Component, Input, OnChanges, signal } from "@angular/core";
import { BooIconComponent } from "../../../../../components/icon/boo-icon/boo-icon.component";
import { BooTextareaComponent } from "../../../../../components/textarea/boo-textarea/boo-textarea.component";
import { NursingService } from "../../../../../services/admin/nursing.service";
import { LocalLoadingService } from "../../../../../services/common/local-loading.service";
import { ToastService } from "../../../../../services/common/toast.service";
import { SharedModule } from "../../../../../shared/shared-imports";
import { Note } from "../../../../../shared/types/note.types";

@Component({
  selector: 'nursing-notes-tab',
  standalone: true,
  imports: [SharedModule, BooIconComponent, BooTextareaComponent],
  template: `
    <div *ngIf="isLoading()" class="flex items-center justify-center py-16">
      <boo-icon name="loader" iconClass="w-6 h-6 text-primary animate-spin"></boo-icon>
    </div>

    <div *ngIf="!isLoading()" class="max-w-2xl">
      <div class="bg-surface border border-gray-200 rounded-lg p-4 mb-4">
        <boo-textarea label="Add Nursing Note" [rows]="3" [(ngModel)]="draft" name="note"></boo-textarea>
        <div class="flex justify-end mt-2">
          <button (click)="submit()" [disabled]="!draft.trim() || loadingSrv.isLoading('note-add')"
            class="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50">
            Add Note
          </button>
        </div>
      </div>

      <ul class="space-y-3 m-0 p-0 list-none">
        <li *ngFor="let n of notes()" class="bg-surface border border-gray-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold text-primary">{{ n.writtenBy }}</span>
            <span class="text-xs text-secondary">{{ n.time | date:'medium' }}</span>
          </div>
          <p class="text-sm text-primary whitespace-pre-wrap m-0">{{ n.content }}</p>
        </li>
      </ul>
      <div *ngIf="!notes().length" class="px-5 py-8 text-center text-xs text-secondary">No nursing notes yet.</div>
    </div>
  `,
})
export class NursingNotesTabComponent implements OnChanges {
  @Input({ required: true }) patientId!: string;

  isLoading = signal(true);
  notes = signal<Note[]>([]);
  draft = '';

  constructor(private srv: NursingService, private toastSrv: ToastService, protected loadingSrv: LocalLoadingService) { }

  ngOnChanges(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);
    this.srv.getNotes(this.patientId).subscribe({
      next: (res) => { if (res.success) this.notes.set(res.data.items); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });
  }

  submit(): void {
    const content = this.draft.trim();
    if (!content) return;
    this.loadingSrv.setLoading('note-add', true);
    this.srv.addNote(this.patientId, content).subscribe({
      next: (res) => {
        this.loadingSrv.setLoading('note-add', false);
        if (res.success) {
          this.notes.set([res.data, ...this.notes()]);
          this.draft = '';
          this.toastSrv.success('Note added');
        } else {
          this.toastSrv.error('Unable to add note');
        }
      },
      error: () => { this.loadingSrv.setLoading('note-add', false); this.toastSrv.error('Unable to add note'); },
    });
  }
}
