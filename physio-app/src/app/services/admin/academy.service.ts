import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { BASE_API } from "../../shared/api/base";
import { createHttpContext } from "../../shared/contexts/option.context";
import { Course, CourseSummary, Lesson, SaveCoursePayload, SaveLessonPayload } from "../../shared/types/academy.types";
import { PagedResponse } from "../../shared/types/common";
import { LoadingKeys } from "../../shared/types/loading";

/** Staff training courses (see docs/academy-redesign.md). The `manage` calls need the academy:course:manage permission. */
@Injectable({ providedIn: 'root' })
export class AcademyService {
  // #region Inject Services
  private readonly http = inject(HttpClient);
  // #endregion

  // #region Courses
  getCourses(search: string, category: string, manage: boolean) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);

    const url = manage ? BASE_API.ACADEMY.COURSES_MANAGE : BASE_API.ACADEMY.COURSES;
    return this.http.get<PagedResponse<CourseSummary[]>>(url, { params, context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.COURSES }) });
  }

  getCourse(courseId: string, manage: boolean) {
    const url = manage ? BASE_API.ACADEMY.COURSE_MANAGE(courseId) : BASE_API.ACADEMY.COURSE(courseId);
    return this.http.get<PagedResponse<Course>>(url, { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.COURSE }) });
  }

  createCourse(payload: SaveCoursePayload) {
    return this.http.post<PagedResponse<CourseSummary>>(BASE_API.ACADEMY.COURSES, payload, { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.COURSE_SAVE }) });
  }

  updateCourse(courseId: string, payload: SaveCoursePayload) {
    return this.http.put<PagedResponse<string>>(BASE_API.ACADEMY.COURSE(courseId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.COURSE_SAVE }) });
  }

  deleteCourse(courseId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.ACADEMY.COURSE(courseId), { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.COURSE_DELETE }) });
  }
  // #endregion

  // #region Lessons
  createLesson(courseId: string, payload: SaveLessonPayload) {
    return this.http.post<PagedResponse<Lesson>>(BASE_API.ACADEMY.LESSON_CREATE(courseId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.LESSON_SAVE }) });
  }

  updateLesson(lessonId: string, payload: SaveLessonPayload) {
    return this.http.put<PagedResponse<Lesson>>(BASE_API.ACADEMY.LESSON(lessonId), payload, { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.LESSON_SAVE }) });
  }

  deleteLesson(lessonId: string) {
    return this.http.delete<PagedResponse<string>>(BASE_API.ACADEMY.LESSON(lessonId), { context: createHttpContext({ loadingKey: LoadingKeys.ACADEMY.LESSON_DELETE }) });
  }

  setLessonCompleted(lessonId: string, completed: boolean) {
    const context = createHttpContext({ loadingKey: LoadingKeys.ACADEMY.LESSON_COMPLETE });
    return completed
      ? this.http.post<PagedResponse<string>>(BASE_API.ACADEMY.LESSON_COMPLETE(lessonId), {}, { context })
      : this.http.delete<PagedResponse<string>>(BASE_API.ACADEMY.LESSON_COMPLETE(lessonId), { context });
  }
  // #endregion
}
