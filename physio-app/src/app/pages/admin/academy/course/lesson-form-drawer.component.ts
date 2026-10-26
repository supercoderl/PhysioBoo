import { NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { AcademyService } from '../../../../services/admin/academy.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { Lesson, SaveLessonPayload } from '../../../../shared/types/academy.types';
import { PagedResponse } from '../../../../shared/types/common';

const DEFAULT_DURATION_MINUTES = 10;

/**
 * Create / edit form for a lesson (POST /api/academy/courses/{id}/lessons, PUT /api/academy/lessons/{id}). Open while
 * `open` is true; `lesson` is null for a new lesson. Emits `saved` with the stored lesson so the page can open it.
 * Failures are reported by the global HTTP error toast and the form keeps what was entered.
 */
@Component({
  selector: 'academy-lesson-form-drawer',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    DrawerComponent,
    BooButtonComponent,
    BooIconComponent,
    BooInputComponent,
    BooTextareaComponent,
    CustomScrollbarDirective,
  ],
  template: `
    <drawer [isOpen]="open" [isShowDialog]="form.dirty && !submitting" (close)="discard()">
      <form
        *ngIf="open"
        class="flex flex-col h-svh bg-surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-form-title"
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        [attr.aria-busy]="submitting"
      >
        <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 id="lesson-form-title" class="m-0 text-lg font-semibold leading-tight text-regular break-words">{{ lesson ? 'Edit lesson' : 'New lesson' }}</h2>
            <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
          </div>
          <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close lesson form" (click)="requestClose()">
            <physio-icon name="x" [size]="18" />
          </button>
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4" custom-scrollbar>
          <div>
            <label for="lesson-title" class="block mb-1 text-[13px] font-medium text-regular">Title <span class="text-danger" aria-hidden="true">*</span></label>
            <boo-input id="lesson-title" name="lesson-title" formControlName="title" label="Lesson title" required [maxlength]="200" />
          </div>

          <div>
            <label for="lesson-duration" class="block mb-1 text-[13px] font-medium text-regular">Duration (minutes) <span class="text-danger" aria-hidden="true">*</span></label>
            <boo-input class="sm:max-w-40" id="lesson-duration" name="lesson-duration" type="number" formControlName="durationMinutes" label="Minutes" required [maxlength]="3" />
            <p class="m-0 mt-1 text-xs text-secondary">Whole minutes, 1 to 600.</p>
            <p *ngIf="form.controls.durationMinutes.touched && form.controls.durationMinutes.invalid" class="m-0 mt-1 text-xs text-danger" role="alert">Enter a whole number of minutes between 1 and 600.</p>
          </div>

          <div>
            <label for="lesson-content" class="block mb-1 text-[13px] font-medium text-regular">Content <span class="text-danger" aria-hidden="true">*</span></label>
            <boo-textarea id="lesson-content" name="lesson-content" formControlName="content" label="Lesson text" required [rows]="14" [maxlength]="20000" />
            <p class="m-0 mt-1 text-xs text-secondary">Plain text, up to 20,000 characters. Line breaks are kept.</p>
          </div>
        </div>

        <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
          <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
          <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!form.dirty">{{ lesson ? 'Save changes' : 'Add lesson' }}</button>
        </footer>
      </form>
    </drawer>
  `,
})
export class AcademyLessonFormDrawerComponent implements OnChanges {
  @Input() open = false;
  /** Course a new lesson is added to. */
  @Input({ required: true }) courseId = '';
  /** The lesson being edited; null creates a new one. */
  @Input() lesson: Lesson | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<Lesson>();

  private readonly fb = inject(FormBuilder);
  private readonly academySrv = inject(AcademyService);
  private readonly dialogSrv = inject(DialogService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
    content: ['', [Validators.required, Validators.maxLength(20000), Validators.pattern(/\S/)]],
    durationMinutes: ['' as string | number, [Validators.required, Validators.pattern(/^\d+$/), Validators.min(1), Validators.max(600)]],
  });
  submitting = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;
    this.form.reset({
      title: this.lesson?.title ?? '',
      content: this.lesson?.content ?? '',
      durationMinutes: this.lesson?.durationMinutes ?? DEFAULT_DURATION_MINUTES,
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.requestClose();
  }

  submit(): void {
    if (this.submitting) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const payload: SaveLessonPayload = {
      title: value.title.trim(),
      content: value.content.trim(),
      durationMinutes: Number(value.durationMinutes),
    };
    const request$: Observable<PagedResponse<Lesson>> = this.lesson
      ? this.academySrv.updateLesson(this.lesson.id, payload)
      : this.academySrv.createLesson(this.courseId, payload);

    this.submitting = true;
    request$
      .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success) return;
          this.toastSrv.success(payload.title, this.lesson ? 'Lesson updated' : 'Lesson added');
          this.form.markAsPristine();
          this.saved.emit(res.data);
        },
        // The global HTTP error toast reports the failure; the form keeps what was entered.
        error: () => undefined,
      });
  }

  requestClose(): void {
    if (this.submitting) return;
    if (this.form.dirty) this.dialogSrv.confirmUnsavedChanges(() => this.discard());
    else this.discard();
  }

  /** Called once leaving is confirmed (the drawer backdrop asks itself when the form is dirty). */
  discard(): void {
    if (this.submitting) return;
    this.form.markAsPristine();
    this.close.emit();
  }
}
