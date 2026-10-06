using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.DeleteLesson
{
    public sealed class DeleteLessonCommandHandler : CommandHandlerBase, IRequestHandler<DeleteLessonCommand>
    {
        private readonly ILessonRepository _lessonRepository;

        public DeleteLessonCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ILessonRepository lessonRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _lessonRepository = lessonRepository;
        }

        public async Task Handle(DeleteLessonCommand request, CancellationToken cancellationToken)
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

            // Positions only decide the order, so the gap left behind needs no renumbering.
            _lessonRepository.SoftDeleteSingle(lesson, false, cancellationToken);

            await CommitAsync();
        }
    }
}
