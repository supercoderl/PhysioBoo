using Microsoft.EntityFrameworkCore;
using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.SetLessonCompletion
{
    public sealed class SetLessonCompletionCommandHandler : CommandHandlerBase, IRequestHandler<SetLessonCompletionCommand>
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ICourseRepository _courseRepository;
        private readonly ILessonCompletionRepository _completionRepository;
        private readonly IUser _user;

        public SetLessonCompletionCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILessonRepository lessonRepository,
            ICourseRepository courseRepository,
            ILessonCompletionRepository completionRepository,
            IUser user
        ) : base(bus, unitOfWork, notifications)
        {
            _lessonRepository = lessonRepository;
            _courseRepository = courseRepository;
            _completionRepository = completionRepository;
            _user = user;
        }

        public async Task Handle(SetLessonCompletionCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Lesson? lesson = await _lessonRepository.GetByIdAsync(request.LessonId, ct: cancellationToken);
            if (lesson == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Lesson with id {request.LessonId} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // Progress is only recorded on published courses; a draft behaves like a missing course.
            if (!await _courseRepository.ExistsAsync(c => c.Id == lesson.CourseId && c.IsPublished, cancellationToken))
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    "This course is not published.",
                    DomainErrorCodes.Academy.CourseNotPublished
                ));
                return;
            }

            Guid userId = _user.GetUserId();
            LessonCompletion? existing = await _completionRepository.GetByIdAsync(
                await FindCompletionIdAsync(request.LessonId, userId, cancellationToken) ?? Guid.Empty,
                ct: cancellationToken
            );

            if (request.Completed)
            {
                if (existing != null) return;

                LessonCompletion completion = new LessonCompletion(
                    Guid.NewGuid(), lesson.CourseId, lesson.Id, userId, TimeZoneHelper.GetLocalTimeNow());
                completion.SetTenantId(_user.GetTenantId());
                completion.SetCreatedBy(userId);

                SharedKernel.Results.DbResult<Guid> inserted = await _completionRepository.InsertAsync<LessonCompletion, Guid>(completion);
                if (!inserted.Success)
                {
                    await NotifyAsync(new DomainNotification(
                        request.MessageType,
                        $"Failed to save progress: {inserted.Error}",
                        ErrorCodes.CommitFailed
                    ));
                }
                return;
            }

            if (existing == null) return;

            _completionRepository.SoftDeleteSingle(existing, false, cancellationToken);

            await CommitAsync();
        }

        private async Task<Guid?> FindCompletionIdAsync(Guid lessonId, Guid userId, CancellationToken cancellationToken)
        {
            return await _completionRepository
                .GetAllNoTracking(c => c.LessonId == lessonId && c.UserId == userId)
                .Select(c => (Guid?)c.Id)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
