import { Component, HostListener, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminBreadcrumbComponent } from "../../../../components/breadcrumb/admin-breadcrumb.component";
import { BooIconComponent } from "../../../../components/icon/boo-icon/boo-icon.component";
import { EmptyStateComponent } from "../../../../components/ui/empty-state.component";
import { AcademyService } from '../../../../services/admin/academy.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DialogService } from '../../../../services/common/dialog.service';
import { ToastService } from '../../../../services/common/toast.service';
import { Permissions } from '../../../../shared/constants/permission.constant';
import { SharedModule } from '../../../../shared/shared-imports';
import { Course, Lesson } from '../../../../shared/types/academy.types';

interface CourseDraft { title: string; category: string; description: string; isPublished: boolean; }
interface LessonDraft { id: string | null; title: string; content: string; durationMinutes: number; }

@Component({
  selector: 'app-academy-course',
  standalone: true,
  imports: [
    AdminBreadcrumbComponent,
    SharedModule,
    BooIconComponent,
    EmptyStateComponent
  ],
  templateUrl: './course.component.html'
})
export class CourseAcademyComponent implements OnInit {
  course = signal<Course | null>(null);
  selectedId = signal<string | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  canManage = false;

  courseDraft = signal<CourseDraft | null>(null);
  lessonDraft = signal<LessonDraft | null>(null);

  private courseId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private academySrv: AcademyService,
    private authSrv: AuthService,
    private toastSrv: ToastService,
    private dialogSrv: DialogService
  ) { }

  // #region Lifecycle
  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id') ?? '';
    this.canManage = this.authSrv.hasPermission(Permissions.Academy.CourseManage);
    this.loadCourse();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isSaving()) return;
    this.courseDraft.set(null);
    this.lessonDraft.set(null);
  }

  loadCourse(selectLessonId?: string): void {
    // Managers load through the manage endpoint so a draft course opens for them.
    this.academySrv.getCourse(this.courseId, this.canManage).subscribe({
      next: res => {
        const course = res.success ? res.data : null;
        this.course.set(course);

        // Keep the lesson that is open; otherwise the first one the user has not finished.
        const keep = selectLessonId ?? this.selectedId();
        const fallback = course?.lessons.find(l => !l.isCompleted) ?? course?.lessons[0];
        this.selectedId.set(course?.lessons.some(l => l.id === keep) ? keep! : fallback?.id ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.course.set(null);
        this.isLoading.set(false);
      }
    });
  }

  selectedLesson(): Lesson | null {
    return this.course()?.lessons.find(l => l.id === this.selectedId()) ?? null;
  }

  progress(): number {
    const course = this.course();
    return course?.lessonCount ? Math.round(course.completedLessons * 100 / course.lessonCount) : 0;
  }
  // #endregion

  // #region Learning
  toggleCompleted(lesson: Lesson): void {
    const completed = !lesson.isCompleted;

    this.academySrv.setLessonCompleted(lesson.id, completed).subscribe(res => {
      if (!res.success) return;

      const course = this.course();
      if (!course) return;

      lesson.isCompleted = completed;
      course.completedLessons += completed ? 1 : -1;
      this.course.set({ ...course });

      if (completed) this.goToNext(lesson);
    });
  }

  private goToNext(lesson: Lesson): void {
    const lessons = this.course()?.lessons ?? [];
    const next = lessons[lessons.findIndex(l => l.id === lesson.id) + 1];
    if (next) this.selectedId.set(next.id);
  }
  // #endregion

  // #region Course editing
  openCourseEditor(): void {
    const course = this.course();
    if (!course) return;

    this.courseDraft.set({
      title: course.title,
      category: course.category,
      description: course.description ?? '',
      isPublished: course.isPublished
    });
  }

  canSaveCourse(): boolean {
    const draft = this.courseDraft();
    return !!draft && !!draft.title.trim() && !!draft.category.trim() && !this.isSaving();
  }

  saveCourse(): void {
    const draft = this.courseDraft();
    if (!draft || !this.canSaveCourse()) return;

    this.isSaving.set(true);
    this.academySrv.updateCourse(this.courseId, {
      title: draft.title.trim(),
      category: draft.category.trim(),
      description: draft.description.trim() || null,
      isPublished: draft.isPublished
    }).subscribe({
      next: res => {
        this.isSaving.set(false);
        if (!res.success) return;

        this.toastSrv.success('Course updated');
        this.courseDraft.set(null);
        this.loadCourse();
      },
      error: () => this.isSaving.set(false)
    });
  }

  deleteCourse(): void {
    const course = this.course();
    if (!course) return;

    this.dialogSrv.confirmDelete(() => {
      this.academySrv.deleteCourse(course.id).subscribe(res => {
        if (!res.success) return;

        this.toastSrv.success('Course deleted');
        this.router.navigate(['/admin/academy/list']);
      });
    }, `the course "${course.title}"`);
  }
  // #endregion

  // #region Lesson editing
  openLessonEditor(lesson?: Lesson): void {
    this.lessonDraft.set(lesson
      ? { id: lesson.id, title: lesson.title, content: lesson.content, durationMinutes: lesson.durationMinutes }
      : { id: null, title: '', content: '', durationMinutes: 10 });
  }

  canSaveLesson(): boolean {
    const draft = this.lessonDraft();
    return !!draft && !!draft.title.trim() && !!draft.content.trim()
      && draft.durationMinutes >= 1 && draft.durationMinutes <= 600 && !this.isSaving();
  }

  saveLesson(): void {
    const draft = this.lessonDraft();
    if (!draft || !this.canSaveLesson()) return;

    const payload = { title: draft.title.trim(), content: draft.content.trim(), durationMinutes: draft.durationMinutes };
    const request = draft.id
      ? this.academySrv.updateLesson(draft.id, payload)
      : this.academySrv.createLesson(this.courseId, payload);

    this.isSaving.set(true);
    request.subscribe({
      next: res => {
        this.isSaving.set(false);
        if (!res.success) return;

        this.toastSrv.success(draft.id ? 'Lesson updated' : 'Lesson added');
        this.lessonDraft.set(null);
        this.loadCourse(res.data.id);
      },
      error: () => this.isSaving.set(false)
    });
  }

  deleteLesson(lesson: Lesson): void {
    this.dialogSrv.confirmDelete(() => {
      this.academySrv.deleteLesson(lesson.id).subscribe(res => {
        if (!res.success) return;

        this.toastSrv.success('Lesson deleted');
        this.loadCourse();
      });
    }, `the lesson "${lesson.title}"`);
  }
  // #endregion

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
