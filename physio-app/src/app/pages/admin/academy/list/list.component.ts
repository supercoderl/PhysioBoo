import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BooButtonComponent,
  BooEmptyStateComponent,
  BooErrorStateComponent,
  BooFilterChip,
  BooFilterChipsComponent,
  BooIconComponent,
  BooInlineErrorComponent,
  BooInlineErrorState,
  BooSearchFieldComponent,
  BooStatusBadgeComponent,
} from '@physioboo/ui';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, finalize, map, switchMap } from 'rxjs/operators';
import { BooSelectComponent } from '../../../../components/select/boo-select/boo-select.component';
import { AcademyService } from '../../../../services/admin/academy.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { CourseSummary } from '../../../../shared/types/academy.types';
import { AcademyCourseFormDrawerComponent } from './course-form-drawer.component';

type LoadError = 'forbidden' | 'failed';

interface FilterChip extends BooFilterChip {
  kind: 'search' | 'category';
}

interface Overview {
  courses: number;
  published: number;
  drafts: number;
  lessons: number;
  minutes: number;
}

const SEARCH_DEBOUNCE_MS = 300;
const ALL_CATEGORIES = '';

/**
 * Academy course catalog (GET /api/academy/courses, or .../manage for managers, which also returns drafts).
 * The API searches title and description, filters by category and returns the whole list unpaged, so those are the
 * only controls offered. The overview and category list come from the last unfiltered load.
 */
@Component({
  selector: 'app-academy-list',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgFor,
    FormsModule,
    RouterLink,
    BooButtonComponent,
    BooIconComponent,
    BooSearchFieldComponent,
    BooFilterChipsComponent,
    BooSelectComponent,
    BooStatusBadgeComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooInlineErrorComponent,
    AcademyCourseFormDrawerComponent,
  ],
  templateUrl: './list.component.html',
  host: { class: 'flex flex-col min-h-full' },
})
export class ListAcademyComponent implements OnInit {
  private readonly academySrv = inject(AcademyService);
  private readonly authSrv = inject(AuthService);
  private readonly dialogSrv = inject(DialogService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly load$ = new Subject<void>();
  private readonly query$ = new Subject<void>();
  private lastSearched = '';

  readonly skeletonRows = Array.from({ length: 6 });

  query = '';
  category = ALL_CATEGORIES;
  canManage = false;
  /** Managers see drafts and the management actions; others see published courses only. */
  manageMode = false;

  courses: CourseSummary[] = [];
  categories: string[] = [];
  overview: Overview | null = null;
  loaded = false;
  loading = false;
  /** A keystroke is waiting for its debounced search. */
  searchPending = false;
  loadError: LoadError | null = null;
  refreshErrorState: BooInlineErrorState = 'default';
  /** Courses with a publish change or delete in flight; their actions are disabled. */
  busyIds = new Set<string>();

  formOpen = false;
  editing: CourseSummary | null = null;

  ngOnInit(): void {
    this.canManage = this.authSrv.hasPermission(Permissions.Academy.CourseManage);
    this.manageMode = this.canManage;

    // switchMap drops the response of a request the user has already moved past; errors are caught per request so
    // the stream stays alive for the next one.
    this.load$
      .pipe(
        switchMap(() => {
          this.loading = true;
          const search = this.searchTerm;
          const category = this.category;
          return this.academySrv.getCourses(search, category, this.manageMode).pipe(
            map(res => ({ res, err: null as HttpErrorResponse | null, search, category })),
            catchError((err: HttpErrorResponse) => of({ res: null, err, search, category })),
            finalize(() => this.loading = false),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ res, err, search, category }) => {
        if (err || !res?.success || !res.data) {
          this.refreshErrorState = this.loaded && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
          this.loadError = err?.status === 403 ? 'forbidden' : 'failed';
          return;
        }
        this.courses = res.data;
        this.loaded = true;
        this.loadError = null;
        this.refreshErrorState = 'default';
        // Overview and categories describe the whole catalog, so they are only rebuilt from an unfiltered load.
        if (!search && !category) {
          this.categories = [...new Set(res.data.map(c => c.category))].sort((a, b) => a.localeCompare(b));
          this.overview = this.buildOverview(res.data);
        }
      });

    this.query$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const term = this.searchTerm;
        this.searchPending = false;
        if (term === this.lastSearched) return;
        this.lastSearched = term;
        this.load();
      });

    this.load();
  }

  // #region Getters
  get searchTerm(): string {
    return this.query.trim();
  }

  get hasFilters(): boolean {
    return !!this.searchTerm || !!this.category;
  }

  get categoryOptions(): { label: string; value: string }[] {
    return [{ label: 'All categories', value: ALL_CATEGORIES }, ...this.categories.map(c => ({ label: c, value: c }))];
  }

  get chips(): FilterChip[] {
    const chips: FilterChip[] = [];
    if (this.searchTerm) chips.push({ kind: 'search', label: `Search “${this.searchTerm}”` });
    if (this.category) chips.push({ kind: 'category', label: `Category: ${this.category}` });
    return chips;
  }

  get canEdit(): boolean {
    return this.canManage && this.manageMode;
  }

  get hours(): string {
    const minutes = this.overview?.minutes ?? 0;
    return minutes >= 60 ? `${+(minutes / 60).toFixed(1)} h` : `${minutes} min`;
  }
  // #endregion

  // #region Loading and filters
  load(): void {
    if (this.loaded && this.loadError === 'failed') this.refreshErrorState = 'retrying';
    this.load$.next();
  }

  onQueryChange(): void {
    this.searchPending = this.searchTerm !== this.lastSearched;
    this.query$.next();
  }

  clearSearch(): void {
    this.query = '';
    this.lastSearched = '';
    this.searchPending = false;
    this.load();
  }

  onCategoryChange(): void {
    this.load();
  }

  removeChip(chip: FilterChip): void {
    if (chip.kind === 'search') {
      this.clearSearch();
      return;
    }
    this.category = ALL_CATEGORIES;
    this.load();
  }

  clearFilters(): void {
    this.query = '';
    this.lastSearched = '';
    this.searchPending = false;
    this.category = ALL_CATEGORIES;
    this.load();
  }

  toggleManage(): void {
    this.manageMode = !this.manageMode;
    this.load();
  }
  // #endregion

  // #region Course actions
  openCreate(): void {
    this.editing = null;
    this.formOpen = true;
  }

  openEdit(course: CourseSummary): void {
    this.editing = course;
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
  }

  onSaved(): void {
    this.formOpen = false;
    this.load();
  }

  togglePublished(course: CourseSummary): void {
    if (this.busyIds.has(course.id)) return;

    this.setBusy(course.id, true);
    this.academySrv.updateCourse(course.id, {
      title: course.title,
      description: course.description,
      category: course.category,
      isPublished: !course.isPublished,
    })
      .pipe(finalize(() => this.setBusy(course.id, false)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success) return;
          this.toastSrv.success(course.title, course.isPublished ? 'Course unpublished' : 'Course published');
          this.load();
        },
        // The global HTTP error toast reports the failure; the row stays as it was.
        error: () => undefined,
      });
  }

  confirmDelete(course: CourseSummary): void {
    if (this.busyIds.has(course.id)) return;

    this.dialogSrv.confirmDelete(() => {
      this.setBusy(course.id, true);
      this.academySrv.deleteCourse(course.id)
        .pipe(finalize(() => this.setBusy(course.id, false)), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => {
            if (!res.success) return;
            this.toastSrv.success(course.title, 'Course deleted');
            this.load();
          },
          error: () => undefined,
        });
    }, `the course "${course.title}"`);
  }
  // #endregion

  // #region Helpers
  progress(course: CourseSummary): number {
    return course.lessonCount ? Math.round(course.completedLessons * 100 / course.lessonCount) : 0;
  }

  trackById(_: number, course: CourseSummary): string {
    return course.id;
  }

  private setBusy(id: string, busy: boolean): void {
    const next = new Set(this.busyIds);
    if (busy) next.add(id); else next.delete(id);
    this.busyIds = next;
  }

  private buildOverview(courses: CourseSummary[]): Overview {
    const published = courses.filter(c => c.isPublished).length;
    return {
      courses: courses.length,
      published,
      drafts: courses.length - published,
      lessons: courses.reduce((sum, c) => sum + c.lessonCount, 0),
      minutes: courses.reduce((sum, c) => sum + c.totalMinutes, 0),
    };
  }
  // #endregion
}
