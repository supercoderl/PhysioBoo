import { NgClass, NgFor, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  BooButtonComponent,
  BooEmptyStateComponent,
  BooErrorStateComponent,
  BooIconComponent,
  BooInlineErrorComponent,
  BooInlineErrorState,
  BooStatusBadgeComponent,
} from '@physioboo/ui';
import { finalize } from 'rxjs/operators';
import { AcademyService } from '../../../../services/admin/academy.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { Course, Lesson } from '../../../../shared/types/academy.types';
import { AcademyCourseFormDrawerComponent } from '../list/course-form-drawer.component';
import { AcademyLessonFormDrawerComponent } from './lesson-form-drawer.component';

type LoadError = 'notFound' | 'forbidden' | 'failed';

const LIST_ROUTE = '/admin/academy/list';

/**
 * Academy course workspace (GET /api/academy/courses/{id}, or .../manage for managers, which also opens drafts).
 * Learners read lessons and tick them off; managers also edit the course, publish it and add, edit or delete lessons.
 * Course and lesson forms live in drawers that guard their own unsaved changes.
 */
@Component({
  selector: 'app-academy-course',
  standalone: true,
  imports: [
    NgClass,
    NgIf,
    NgFor,
    RouterLink,
    BooButtonComponent,
    BooIconComponent,
    BooStatusBadgeComponent,
    BooEmptyStateComponent,
    BooErrorStateComponent,
    BooInlineErrorComponent,
    AcademyCourseFormDrawerComponent,
    AcademyLessonFormDrawerComponent,
  ],
  templateUrl: './course.component.html',
  host: { class: 'flex flex-col min-h-full' },
})
export class CourseAcademyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly academySrv = inject(AcademyService);
  private readonly authSrv = inject(AuthService);
  private readonly dialogSrv = inject(DialogService);
  private readonly toastSrv = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly listRoute = LIST_ROUTE;
  readonly skeletonRows = Array.from({ length: 5 });

  course: Course | null = null;
  selectedId: string | null = null;
  canManage = false;
  loading = true;
  loadError: LoadError | null = null;
  /** State of the banner shown when a reload fails while the previous course is still on screen. */
  refreshErrorState: BooInlineErrorState = 'default';

  /** A course-level change (publish, delete) is in flight. */
  courseBusy = false;
  /** Lessons with a completion toggle or delete in flight. */
  readonly busyLessonIds = new Set<string>();

  courseFormOpen = false;
  lessonFormOpen = false;
  editingLesson: Lesson | null = null;

  private courseId = '';

  // #region Lifecycle
  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id')?.trim() ?? '';
    this.canManage = this.authSrv.hasPermission(Permissions.Academy.CourseManage);
    this.load();
  }

  /** Loads the course. Content already on screen stays visible while a reload runs. */
  load(selectLessonId?: string): void {
    if (!this.courseId) {
      this.loading = false;
      this.loadError = 'notFound';
      return;
    }

    this.loading = true;
    this.academySrv.getCourse(this.courseId, this.canManage)
      .pipe(finalize(() => this.loading = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success || !res.data) {
            this.fail(this.course ? 'failed' : 'notFound');
            return;
          }

          this.loadError = null;
          this.refreshErrorState = 'default';
          this.course = res.data;
          this.selectedId = this.pickLesson(res.data, selectLessonId ?? this.selectedId);
        },
        error: (err: HttpErrorResponse) => {
          this.fail(err.status === 404 ? 'notFound' : err.status === 403 ? 'forbidden' : 'failed');
        },
      });
  }

  /** Retry from the error panel or the refresh banner. */
  retry(): void {
    if (this.course) this.refreshErrorState = 'retrying';
    this.load();
  }

  private fail(error: LoadError): void {
    // A course that disappeared or became off limits is no longer shown; a plain failure keeps the last good copy.
    if (error !== 'failed') this.course = null;
    this.refreshErrorState = this.course && this.refreshErrorState === 'retrying' ? 'failed' : 'default';
    this.loadError = error;
  }

  /** Keeps the lesson that is open; otherwise the first one the user has not finished. */
  private pickLesson(course: Course, keep: string | null): string | null {
    if (keep && course.lessons.some(l => l.id === keep)) return keep;
    return (course.lessons.find(l => !l.isCompleted) ?? course.lessons[0])?.id ?? null;
  }
  // #endregion

  // #region View state
  get selectedLesson(): Lesson | null {
    return this.course?.lessons.find(l => l.id === this.selectedId) ?? null;
  }

  get selectedIndex(): number {
    return this.course?.lessons.findIndex(l => l.id === this.selectedId) ?? -1;
  }

  get previousLesson(): Lesson | null {
    return this.selectedIndex > 0 ? this.course!.lessons[this.selectedIndex - 1] : null;
  }

  get nextLesson(): Lesson | null {
    return this.selectedIndex >= 0 ? this.course?.lessons[this.selectedIndex + 1] ?? null : null;
  }

  get progress(): number {
    return this.course?.lessonCount ? Math.round(this.course.completedLessons * 100 / this.course.lessonCount) : 0;
  }

  get hours(): string {
    const minutes = this.course?.totalMinutes ?? 0;
    return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
  }
  // #endregion

  // #region Learning
  toggleCompleted(lesson: Lesson): void {
    if (this.busyLessonIds.has(lesson.id)) return;

    const completed = !lesson.isCompleted;
    this.busyLessonIds.add(lesson.id);
    this.academySrv.setLessonCompleted(lesson.id, completed)
      .pipe(finalize(() => this.busyLessonIds.delete(lesson.id)), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          const course = this.course;
          if (!res.success || !course) return;

          this.course = {
            ...course,
            completedLessons: course.completedLessons + (completed ? 1 : -1),
            lessons: course.lessons.map(l => l.id === lesson.id ? { ...l, isCompleted: completed } : l),
          };
          if (completed && this.nextLesson) this.selectedId = this.nextLesson.id;
        },
        // The global HTTP error toast reports the failure; the lesson keeps its previous state.
        error: () => undefined,
      });
  }
  // #endregion

  // #region Course actions
  openCourseForm(): void {
    this.courseFormOpen = true;
  }

  closeCourseForm(): void {
    this.courseFormOpen = false;
  }

  onCourseSaved(): void {
    this.courseFormOpen = false;
    this.load();
  }

  togglePublished(): void {
    const course = this.course;
    if (!course || this.courseBusy) return;

    const publish = !course.isPublished;
    this.courseBusy = true;
    this.academySrv.updateCourse(course.id, {
      title: course.title,
      category: course.category,
      description: course.description,
      isPublished: publish,
    })
      .pipe(finalize(() => this.courseBusy = false), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: res => {
          if (!res.success) return;
          this.toastSrv.success(course.title, publish ? 'Course published' : 'Course unpublished');
          this.load();
        },
        error: () => undefined,
      });
  }

  confirmDeleteCourse(): void {
    const course = this.course;
    if (!course || this.courseBusy) return;

    this.dialogSrv.confirmDelete(() => {
      this.courseBusy = true;
      this.academySrv.deleteCourse(course.id)
        .pipe(finalize(() => this.courseBusy = false), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => {
            if (!res.success) return;
            this.toastSrv.success(course.title, 'Course deleted');
            this.router.navigate([LIST_ROUTE]);
          },
          error: () => undefined,
        });
    }, `the course "${course.title}"`);
  }
  // #endregion

  // #region Lesson actions
  openLessonForm(lesson: Lesson | null = null): void {
    this.editingLesson = lesson;
    this.lessonFormOpen = true;
  }

  closeLessonForm(): void {
    this.lessonFormOpen = false;
  }

  onLessonSaved(lesson: Lesson): void {
    this.lessonFormOpen = false;
    this.load(lesson.id);
  }

  confirmDeleteLesson(lesson: Lesson): void {
    if (this.busyLessonIds.has(lesson.id)) return;

    this.dialogSrv.confirmDelete(() => {
      this.busyLessonIds.add(lesson.id);
      this.academySrv.deleteLesson(lesson.id)
        .pipe(finalize(() => this.busyLessonIds.delete(lesson.id)), takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: res => {
            if (!res.success) return;
            this.toastSrv.success(lesson.title, 'Lesson deleted');
            this.load();
          },
          error: () => undefined,
        });
    }, `the lesson "${lesson.title}"`);
  }
  // #endregion

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
