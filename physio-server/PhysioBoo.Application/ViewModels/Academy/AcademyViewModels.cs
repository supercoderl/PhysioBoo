using PhysioBoo.Domain.Entities.Academy;

namespace PhysioBoo.Application.ViewModels.Academy
{
    // One tile on the course list. The counts are for the signed-in user.
    public class CourseSummaryViewModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public int LessonCount { get; set; }
        public int TotalMinutes { get; set; }
        public int CompletedLessons { get; set; }

        public static CourseSummaryViewModel FromEntity(Course entity, int lessonCount, int totalMinutes, int completedLessons)
        {
            return new CourseSummaryViewModel
            {
                Id = entity.Id,
                Title = entity.Title,
                Description = entity.Description,
                Category = entity.Category,
                IsPublished = entity.IsPublished,
                LessonCount = lessonCount,
                TotalMinutes = totalMinutes,
                CompletedLessons = completedLessons
            };
        }
    }

    public sealed class LessonViewModel
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public int Position { get; set; }
        public bool IsCompleted { get; set; }

        public static LessonViewModel FromEntity(Lesson entity, bool isCompleted)
        {
            return new LessonViewModel
            {
                Id = entity.Id,
                CourseId = entity.CourseId,
                Title = entity.Title,
                Content = entity.Content,
                DurationMinutes = entity.DurationMinutes,
                Position = entity.Position,
                IsCompleted = isCompleted
            };
        }
    }

    public sealed class CourseViewModel : CourseSummaryViewModel
    {
        public List<LessonViewModel> Lessons { get; set; } = new();
    }

    public sealed record SaveCourseViewModel(string Title, string? Description, string Category, bool IsPublished);

    public sealed record SaveLessonViewModel(string Title, string Content, int DurationMinutes);
}
