import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminBreadcrumbComponent } from "../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { AcademyService } from '../../../../services/admin/academy.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SharedModule } from '../../../../shared/shared-imports';
import { CourseSummary } from '../../../../shared/types/academy.types';

const SEARCH_DEBOUNCE_MS = 300;

@Component({
  selector: 'app-academy-list',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    SharedModule,
    BooIconComponent,
    EmptyStateComponent
  ],
  templateUrl: './list.component.html'
})
export class ListAcademyComponent implements OnInit, OnDestroy {
  courses = signal<CourseSummary[]>([]);
  categories = signal<string[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  search = '';
  category = '';
  canManage = false;
  /** Managers can switch to a view that includes drafts and lets them add courses. */
  manageMode = false;

  // New-course dialog; null while it is closed.
  draft = signal<{ title: string; category: string; description: string; isPublished: boolean } | null>(null);

  private readonly search$ = new Subject<string>();
  private searchSub?: Subscription;

  constructor(
    private academySrv: AcademyService,
    private authSrv: AuthService,
    private toastSrv: ToastService
  ) { }

  ngOnInit(): void {
    this.canManage = this.authSrv.hasPermission(Permissions.Academy.CourseManage);
    this.searchSub = this.search$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged())
      .subscribe(() => this.loadCourses());

    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDialog();
  }

  loadCourses(): void {
    this.isLoading.set(true);
    this.academySrv.getCourses(this.search.trim(), this.category, this.manageMode).subscribe({
      next: res => {
        if (res.success) {
          this.courses.set(res.data);
          // The category filter lists every category, so it is only rebuilt from an unfiltered load.
          if (!this.category && !this.search.trim()) {
            this.categories.set([...new Set(res.data.map(c => c.category))].sort());
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearchChange(value: string): void {
    this.search$.next(value.trim());
  }

  selectCategory(category: string): void {
    this.category = this.category === category ? '' : category;
    this.loadCourses();
  }

  toggleManage(): void {
    this.manageMode = !this.manageMode;
    this.loadCourses();
  }

  progress(course: CourseSummary): number {
    return course.lessonCount ? Math.round(course.completedLessons * 100 / course.lessonCount) : 0;
  }

  // #region New course
  openDialog(): void {
    this.draft.set({ title: '', category: this.category, description: '', isPublished: false });
  }

  closeDialog(): void {
    if (!this.isSaving()) this.draft.set(null);
  }

  canCreate(): boolean {
    const draft = this.draft();
    return !!draft && !!draft.title.trim() && !!draft.category.trim() && !this.isSaving();
  }

  createCourse(): void {
    const draft = this.draft();
    if (!draft || !this.canCreate()) return;

    this.isSaving.set(true);
    this.academySrv.createCourse({
      title: draft.title.trim(),
      category: draft.category.trim(),
      description: draft.description.trim() || null,
      isPublished: draft.isPublished
    }).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (!res.success) return;

        this.toastSrv.success('Course created');
        this.draft.set(null);
        this.loadCourses();
      },
      error: () => this.isSaving.set(false)
    });
  }
  // #endregion

  trackById(_: number, course: CourseSummary): string {
    return course.id;
  }
}
