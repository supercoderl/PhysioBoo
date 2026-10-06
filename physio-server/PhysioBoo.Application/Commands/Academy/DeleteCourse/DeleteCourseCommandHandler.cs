using PhysioBoo.Domain.Entities.Academy;
using PhysioBoo.Domain.Errors;
using PhysioBoo.Domain.Interfaces.Repositories;

namespace PhysioBoo.Application.Commands.Academy.DeleteCourse
{
    public sealed class DeleteCourseCommandHandler : CommandHandlerBase, IRequestHandler<DeleteCourseCommand>
    {
        private readonly ICourseRepository _courseRepository;

        public DeleteCourseCommandHandler(
            IMediatorHandler bus,
            IUnitOfWork unitOfWork,
            INotificationHandler<DomainNotification> notifications,
            ICourseRepository courseRepository
        ) : base(bus, unitOfWork, notifications)
        {
            _courseRepository = courseRepository;
        }

        public async Task Handle(DeleteCourseCommand request, CancellationToken cancellationToken)
        {
            if (!await TestValidityAsync(request)) return;

            Course? course = await _courseRepository.GetByIdAsync(request.Id, ct: cancellationToken);
            if (course == null)
            {
                await NotifyAsync(new DomainNotification(
                    request.MessageType,
                    $"Course with id {request.Id} doesn't exist.",
                    ErrorCodes.ObjectNotFound
                ));
                return;
            }

            // Soft delete: the course and its lessons disappear for everyone, and learners' history is kept.
            _courseRepository.SoftDeleteSingle(course, false, cancellationToken);

            await CommitAsync();
        }
    }
}
