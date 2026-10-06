using PhysioBoo.Application.ViewModels.Academy;
using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.UpdateLesson
{
    public sealed class UpdateLessonCommandHandler : CommandHandlerBase, IRequestHandler<UpdateLessonCommand>
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly IUser _user;

        public UpdateLessonCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILessonRepository lessonRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _lessonRepository = lessonRepository;
            _user = user;
        }

        public async Task Handle(UpdateLessonCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Lesson? lesson = await _lessonRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (lesson == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lesson with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            string title = request.Input.Title.Trim();
            string content = request.Input.Content.Trim();
            int duration = request.Input.DurationMinutes;
            Guid? userId = _user.GetUserId();
            DateTime? updatedAt = TimeZoneHelper.GetLocalTimeNow();

            await _lessonRepository.BatchUpdateMultipleAsync(
                l => l.Id == request.Id,
                s => s
                    .SetProperty(l => l.Title, title)
                    .SetProperty(l => l.Content, content)
                    .SetProperty(l => l.DurationMinutes, duration)
                    .SetProperty(l => l.UpdatedBy, userId)
                    .SetProperty(l => l.UpdatedAt, updatedAt),
                cancellationToken
            );

            lesson.SetTitle(title);
            lesson.SetContent(content);
            lesson.SetDurationMinutes(duration);
            request.Result = LessonViewModel.FromEntity(lesson, false);
        }
    }
}
