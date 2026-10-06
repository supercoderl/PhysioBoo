using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Academy;
using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Queries.Academy.GetCourse
{
    public sealed class GetCourseQueryHandler : IRequestHandler<GetCourseQuery, CourseViewModel?>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonCompletionRepository _completionRepository;
        private readonly IMediatorHandler _bus;
        private readonly IUser _user;

        public GetCourseQueryHandler(
            ICourseRepository courseRepository,
            ILessonRepository lessonRepository,
            ILessonCompletionRepository completionRepository,
            IMediatorHandler bus,
            IUser user
        )
        {
            _courseRepository = courseRepository;
            _lessonRepository = lessonRepository;
            _completionRepository = completionRepository;
            _bus = bus;
            _user = user;
        }

        public async Task<CourseViewModel?> Handle(GetCourseQuery request, CancellationToken cancellationToken)
        {
            Course? course = await _courseRepository.GetByIdAsync(request.Id, ct: cancellationToken);

            // A draft looks exactly like a missing course to someone who cannot manage the academy.
            if (course == null || (!course.IsPublished && !request.IncludeDrafts))
            {
                await _bus.RaiseEventAsync(new DomainNotification(
                    nameof(GetCourseQuery),
                    $"Course with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return null;
            }

            Guid userId = _user.GetUserId();

            List<Lesson> lessons = await _lessonRepository
                .GetAllNoTracking(l => l.CourseId == request.Id, orderBy: q => q.OrderBy(l => l.Position))
                .ToListAsync(cancellationToken);

            HashSet<Guid> completedIds = (await _completionRepository
                .GetAllNoTracking(c => c.CourseId == request.Id && c.UserId == userId)
                .Select(c => c.LessonId)
                .ToListAsync(cancellationToken)).ToHashSet();

            return new CourseViewModel
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Category = course.Category,
                IsPublished = course.IsPublished,
                LessonCount = lessons.Count,
                TotalMinutes = lessons.Sum(l => l.DurationMinutes),
                CompletedLessons = lessons.Count(l => completedIds.Contains(l.Id)),
                Lessons = lessons.Select(l => LessonViewModel.FromEntity(l, completedIds.Contains(l.Id))).ToList()
            };
        }
    }
}
