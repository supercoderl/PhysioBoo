import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooButtonComponent, BooCheckboxComponent, BooIconComponent, BooInputComponent } from '@physioboo/ui';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DrawerComponent } from '../../../../components/drawer/drawer.component';
import { BooTextareaComponent } from '../../../../components/textarea/boo-textarea/boo-textarea.component';
import { AcademyService } from '../../../../services/admin/academy.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { CustomScrollbarDirective } from '../../../../shared/directives/scrollbar.directive';
import { CourseSummary, SaveCoursePayload } from '../../../../shared/types/academy.types';
import { PagedResponse } from '../../../../shared/types/common';

/**
 * Create / edit form for a course (POST /api/academy/courses, PUT /api/academy/courses/{id}). Open while `open` is
 * true; `course` is null for a new course. Failures are reported by the global HTTP error toast and the form keeps
 * what was entered.
 */
@Component({
  selector: 'academy-course-form-drawer',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ReactiveFormsModule,
    DrawerComponent,
    BooButtonComponent,
    BooIconComponent,
    BooInputComponent,
    BooCheckboxComponent,
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
        aria-labelledby="course-form-title"
        [formGroup]="form"
        (ngSubmit)="submit()"
        novalidate
        [attr.aria-busy]="submitting"
      >
        <header class="flex-none px-6 py-4 border-b border-rowDivider flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 id="course-form-title" class="m-0 text-lg font-semibold leading-tight text-regular break-words">{{ course ? 'Edit course' : 'New course' }}</h2>
            <p class="m-0 mt-0.5 text-xs text-secondary">Fields marked <span class="text-danger">*</span> are required.</p>
          </div>
          <button type="button" boo-button variant="ghost" size="sm" [iconOnly]="true" aria-label="Close course form" (click)="requestClose()">
            <physio-icon name="x" [size]="18" />
          </button>
        </header>

        <div class="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-4" custom-scrollbar>
          <div>
            <label for="course-title" class="block mb-1 text-[13px] font-medium text-regular">Title <span class="text-danger" aria-hidden="true">*</span></label>
            <boo-input name="course-title" formControlName="title" label="Course title" required [maxlength]="200" />
          </div>

          <div>
            <label for="course-category" class="block mb-1 text-[13px] font-medium text-regular">Category <span class="text-danger" aria-hidden="true">*</span></label>
            <boo-input name="course-category" formControlName="category" label="e.g. Clinical skills" required [maxlength]="60" />
            <div *ngIf="categories.length" class="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Existing categories">
              <span class="text-xs text-secondary">Existing:</span>
              <button
                *ngFor="let c of categories"
                type="button"
                boo-button
                variant="soft"
                size="sm"
                (click)="pickCategory(c)"
              >{{ c }}</button>
            </div>
          </div>

          <div>
            <label for="course-description" class="block mb-1 text-[13px] font-medium text-regular">Description</label>
            <boo-textarea id="course-description" formControlName="description" label="What will learners get from this course?" [rows]="4" />
            <p *ngIf="form.controls.description.hasError('maxlength')" class="m-0 mt-1 text-xs text-danger" role="alert">Keep the description within 2000 characters.</p>
          </div>

          <div>
            <boo-checkbox formControlName="isPublished" label="Published" />
            <p class="m-0 mt-1 text-xs text-secondary">Unpublished courses stay drafts and are hidden from learners.</p>
          </div>
        </div>

        <footer class="flex-none px-6 py-4 border-t border-rowDivider flex items-center justify-end gap-2">
          <button type="button" boo-button variant="secondary" size="sm" [disabled]="submitting" (click)="requestClose()">Cancel</button>
          <button type="submit" boo-button variant="primary" size="sm" [loading]="submitting" [disabled]="!form.dirty">{{ course ? 'Save changes' : 'Create course' }}</button>
        </footer>
      </form>
    </drawer>
  `,
})
export class AcademyCourseFormDrawerComponent implements OnChanges {
  @Input() open = false;
  /** The course being edited; null creates a new one. */
  @Input() course: CourseSummary | null = null;
  /** Categories already in use, offered as shortcuts. */
  @Input() categories: string[] = [];
  /** Category a new course starts with (the list's active filter). */
  @Input() defaultCategory = '';
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly academySrv = inject(AcademyService);
  private readonly dialogSrv = inject(DialogService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200), Validators.pattern(/\S/)]],
    category: ['', [Validators.required, Validators.maxLength(60), Validators.pattern(/\S/)]],
    description: ['', Validators.maxLength(2000)],
    isPublished: false,
  });
  submitting = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open'] || !this.open) return;
    this.form.reset({
      title: this.course?.title ?? '',
      category: this.course?.category ?? this.defaultCategory,
      description: this.course?.description ?? '',
      isPublished: this.course?.isPublished ?? false,
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.requestClose();
  }

  pickCategory(category: string): void {
    this.form.controls.category.setValue(category);
    this.form.controls.category.markAsDirty();
  }

  submit(): void {
    if (this.submitting) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const payload: SaveCoursePayload = {
      title: value.title.trim(),
      category: value.category.trim(),
      description: value.description.trim() || null,
      isPublished: value.isPublished,
    };
    const request$: Observable<PagedResponse<unknown>> = this.course
      ? this.academySrv.updateCourse(this.course.id, payload)
      : this.academySrv.createCourse(payload);

    this.submitting = true;
    request$
      .pipe(finalize(() => this.submitting = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success) return;
          this.toastSrv.success(payload.title, this.course ? 'Course updated' : 'Course created');
          this.form.markAsPristine();
          this.saved.emit();
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
