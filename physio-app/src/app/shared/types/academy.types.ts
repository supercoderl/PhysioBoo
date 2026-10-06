export interface CourseSummary {
  id: string;
  title: string;
  description: string | null;
  category: string;
  isPublished: boolean;
  lessonCount: number;
  totalMinutes: number;
  /** Lessons the signed-in user has finished. */
  completedLessons: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  durationMinutes: number;
  position: number;
  isCompleted: boolean;
}

export interface Course extends CourseSummary {
  lessons: Lesson[];
}

export interface SaveCoursePayload {
  title: string;
  description: string | null;
  category: string;
  isPublished: boolean;
}

export interface SaveLessonPayload {
  title: string;
  content: string;
  durationMinutes: number;
}
