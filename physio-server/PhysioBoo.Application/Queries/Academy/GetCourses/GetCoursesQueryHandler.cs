using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Academy;
using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Academy.GetCourses
{
    public sealed class GetCoursesQueryHandler : IRequestHandler<GetCoursesQuery, List<CourseSummaryViewModel>>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonCompletionRepository _completionRepository;
        private readonly IUser _user;

        public GetCoursesQueryHandler(
            ICourseRepository courseRepository,
            ILessonRepository lessonRepository,
            ILessonCompletionRepository completionRepository,
            IUser user
        )
        {
            _courseRepository = courseRepository;
            _lessonRepository = lessonRepository;
            _completionRepository = completionRepository;
            _user = user;
        }

        public async Task<List<CourseSummaryViewModel>> Handle(GetCoursesQuery request, CancellationToken cancellationToken)
        {
            bool includeDrafts = request.IncludeDrafts;
            string? category = string.IsNullOrWhiteSpace(request.Category) ? null : request.Category.Trim();

            List<Course> courses = await _courseRepository
                .GetAllNoTracking(c => (includeDrafts || c.IsPublished) && (category == null || c.Category == category))
                .OrderBy(c => c.Category)
                .ThenBy(c => c.Title)
                .ToListAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(request.Search))
            {
                string term = request.Search.Trim();
                courses = courses.Where(c =>
                    c.Title.Contains(term, StringComparison.OrdinalIgnoreCase)
                    || (c.Description?.Contains(term, StringComparison.OrdinalIgnoreCase) ?? false)).ToList();
            }

            List<Guid> courseIds = courses.Select(c => c.Id).ToList();
            Guid userId = _user.GetUserId();

            // One grouped query per count for all courses, instead of two per course.
            var lessonTotals = await _lessonRepository
                .GetAllNoTracking(l => courseIds.Contains(l.CourseId))
                .GroupBy(l => l.CourseId)
                .Select(g => new { CourseId = g.Key, Count = g.Count(), Minutes = g.Sum(l => l.DurationMinutes) })
                .ToDictionaryAsync(x => x.CourseId, cancellationToken);

            Dictionary<Guid, int> completed = await _completionRepository
                .GetAllNoTracking(c => c.UserId == userId && courseIds.Contains(c.CourseId))
                .GroupBy(c => c.CourseId)
                .Select(g => new { CourseId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CourseId, x => x.Count, cancellationToken);

            return courses
                .Select(c =>
                {
                    lessonTotals.TryGetValue(c.Id, out var totals);
                    return CourseSummaryViewModel.FromEntity(c, totals?.Count ?? 0, totals?.Minutes ?? 0, completed.GetValueOrDefault(c.Id));
                })
                .ToList();
        }
    }
}
