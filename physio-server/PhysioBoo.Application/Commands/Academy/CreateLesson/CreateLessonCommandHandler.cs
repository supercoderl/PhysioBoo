using Microsoft.EntityFrameworkCore;
using PhysioBoo.Application.ViewModels.Academy;
using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.CreateLesson
{
    public sealed class CreateLessonCommandHandler : CommandHandlerBase, IRequestHandler<CreateLessonCommand>
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly IUser _user;

        public CreateLessonCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ICourseRepository courseRepository,
            ILessonRepository lessonRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _courseRepository = courseRepository;
            _lessonRepository = lessonRepository;
            _user = user;
        }

        public async Task Handle(CreateLessonCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            if (!await _courseRepository.ExistsAsync(request.CourseId, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Course with id {request.CourseId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // New lessons go to the end of the course.
            int? last = await _lessonRepository
                .GetAllNoTracking(l => l.CourseId == request.CourseId)
                .MaxAsync(l => (int?)l.Position, cancellationToken);

            Lesson lesson = new Lesson(
                request.NewId,
                request.CourseId,
                request.Input.Title.Trim(),
                request.Input.Content.Trim(),
                request.Input.DurationMinutes,
                (last ?? -1) + 1
            );
            lesson.SetTenantId(_user.GetTenantId());
            lesson.SetCreatedBy(_user.GetUserId());

            SharedKernel.Results.DbResult<Guid> inserted = await _lessonRepository.InsertAsync<Lesson, Guid>(lesson);
            if (!inserted.Success)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Failed to create lesson: {inserted.Error}",
                    ErrorCodes.CommitFailed
                ));
                return;
            }

            request.Result = LessonViewModel.FromEntity(lesson, false);
        }
    }
}
